import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

const TTS_MODEL = "ja-JP-Chirp3-HD-Enceladus";

function generateHash(text: string): string {
  return createHash("sha256").update(TTS_MODEL + text).digest("hex");
}

interface RequestParams {
  ssml: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    // Get the "ssml" from the request body
    const params = req.body as RequestParams;
    const ssml = params.ssml;
    if (!ssml) {
      return res.status(400).json({ error: "Missing parameter 'ssml'" });
    }

    // generate a hash from the SSML
    const hash = generateHash(ssml);

    // Initialize the TextToSpeechClient and Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL as string,
      process.env.SUPABASE_SERVICE_ROLE_KEY as string,
    );
    const client = new TextToSpeechClient({
      projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
      credentials: {
        client_email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY?.replace(
          /\\n/g,
          "\n",
        ),
      },
    });

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
        const [response] = await client.synthesizeSpeech({
          input: { text: ssml },
          voice: {
            languageCode: "ja-JP",
            name: TTS_MODEL,
          },
          audioConfig: { speakingRate: 0.95, audioEncoding: "MP3" },
        });
        if (!response.audioContent) {
          return res.status(500).json({
            error: "Failed to generate audio content",
          });
        }

        const { data: uploadData, error: uploadError } = await supabase
          .storage.from("tts").upload(
            filename,
            response.audioContent,
            { contentType: "audio/mpeg" },
          );
        if (uploadError) {
          return res.status(500).json({
            error: "Failed to upload audio content",
            Details: JSON.stringify(uploadError),
          });
        }

        // Get the public URL of the uploaded file
        const { data: storageFile } = await supabase.storage
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
