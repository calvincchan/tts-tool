import { TextToSpeechClient } from "@google-cloud/text-to-speech";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import type { NextApiRequest, NextApiResponse } from "next";

function generateHash(text: string): string {
  return createHash("sha256").update(text).digest("hex");
}

interface RequestParams {
  id: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method === "POST") {
    // Get the "id" from the request body
    const params = req.body as RequestParams;
    console.log("🚀 ~ params", params);
    const recordId = params.id;
    if (!recordId) {
      return res.status(400).json({ error: "recordId parameter is required" });
    }

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

    // fetch the record from the database
    let ssml: string = "", hash: string = "";
    {
      const { data: record, error } = await supabase
        .from("speech_scripts")
        .select("content")
        .eq("id", recordId)
        .single();
      if (error) {
        return res.status(500).json({
          error: "Record not found",
          message: error.message,
        });
      }
      console.log("🚀 ~ record", record);
      ssml = record.content;
      hash = generateHash(ssml);
    }

    // Check if the hash exists in the storage
    const filename = `${recordId}-${hash}.mp3`;
    let url: string = "";
    {
      const { data: storageFile } = await supabase.storage
        .from("tts")
        .getPublicUrl(filename);
      if (storageFile?.publicUrl) {
        url = storageFile.publicUrl;
      } else {
        // If the file does not exist, generate the TTS
        const [response] = await client.synthesizeSpeech({
          input: { ssml },
          voice: {
            languageCode: "ja-JP",
            name: "ja-JP-Wavenet-D",
          },
          audioConfig: { audioEncoding: "MP3", pitch: -1 },
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
        url = uploadData.fullPath;
      }
    }

    /* Return the URL of the audio file */
    res.status(200).json({ url });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
