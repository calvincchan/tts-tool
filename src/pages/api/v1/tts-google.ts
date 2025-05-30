import { createClient } from "@supabase/supabase-js";
import axios, { AxiosError } from 'axios';
import { createHash } from "crypto";
import { GoogleAuth } from 'google-auth-library';
import type { NextApiRequest, NextApiResponse } from "next";

/* default TTS model */
const TTS_MODEL = "ja-JP-Chirp3-HD-Enceladus";

function generateHash(text: string): string {
  return createHash("sha256").update(TTS_MODEL + text).digest("hex");
}

/**
 * Invoke the Google TTS API to synthesize speech from text. Input text is passed via the "input.markup" param to ensure proper pause handling with chirp3-hd model.
 * https://cloud.google.com/text-to-speech/docs/chirp3-hd#pause_control
 */
async function synthesize(text: string) {
  // Create a new GoogleAuth instance which reads GOOGLE_APPLICATION_CREDENTIALS env var
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    credentials: {
      client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(
        /\\n/g,
        "\n",
      ),
    },
  });

  // Get the access token
  const client = await auth.getClient();
  const accessToken = await client.getAccessToken();

  // Get the project ID
  const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;

  // Prepare the request payload
  const payload = {
    input: {
      markup: text
    },
    voice: {
      languageCode: "ja-JP",
      name: process.env.VOICE_NAME || TTS_MODEL,
    },
    audioConfig: {
      audioEncoding: "LINEAR16"
    }
  };

  try {
    // Make the API call
    const response = await axios({
      method: 'post',
      url: 'https://texttospeech.googleapis.com/v1/text:synthesize',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-User-Project': projectId,
        'Authorization': `Bearer ${accessToken.token}`
      },
      data: payload
    });

    // The API returns base64-encoded audio content
    const audioContent = Buffer.from(response.data.audioContent, 'base64');

    // Write the binary audio content to a file
    return { data: audioContent, error: null };
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle Axios error
      const axiosError = error as AxiosError;
      const errorMessage = axiosError.response?.data as { error: { message: string; }; };
      console.log("Error details:", typeof errorMessage.error.message);
      return {
        data: null,
        error: new Error(errorMessage.error.message || 'Axios error occurred'),
      };
    }
    // Handle other errors (e.g., network issues, etc.)
    console.error('Error during TTS synthesis:', error);
    return { data: null, error: error instanceof Error ? error : new Error('Unknown error') };
  }
}

interface RequestParams {
  text: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    // Get the "text" from the request body
    const params = req.body as RequestParams;
    const text = params.text;
    if (!text) {
      return res.status(400).json({ error: "Missing parameter 'text'" });
    }

    // generate a hash from the text
    const hash = generateHash(text);

    // Initialize the TextToSpeechClient and Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    );

    // Check if the hash exists in the storage
    const filename = `${hash}.mp3`;
    let url: string = "";
    {
      const { data: storageFileExists } = await supabase.storage
        .from("tts")
        .exists(filename);
      if (storageFileExists) {
        const { data: storageFile } = await supabase.storage
          .from("tts")
          .getPublicUrl(filename);
        url = storageFile.publicUrl;
      } else {
        // If the file does not exist, generate the TTS
        const { data: audioContent, error: generateError } = await synthesize(text);
        if (generateError) {
          return res.status(500).json({
            error: generateError.message || "Failed to generate TTS",
          });
        }

        const { data: uploadData, error: uploadError } = await supabase
          .storage.from("tts").upload(
            filename,
            audioContent,
            { contentType: "audio/mpeg" },
          );
        if (uploadError) {
          return res.status(500).json({
            error: "Failed to upload audio content",
            Details: JSON.stringify(uploadError),
          });
        }

        // Get the public URL of the uploaded file
        const { data: storageFile } = supabase.storage
          .from("tts")
          .getPublicUrl(filename);
        url = storageFile.publicUrl;
      }
    }

    /* Return the URL of the audio file */
    res.status(200).json({ url, hash });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
