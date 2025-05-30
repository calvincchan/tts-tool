"use client";

import { ISpeechScript, SpeechScriptStatus } from "@/types/type";
import { DAYJS_FORMAT } from "@/utils/constants";
import {
  Check,
  ContentCopy,
  Download,
  Pause,
  PlayArrow
} from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { HttpError } from "@refinedev/core";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import WavesurferPlayer from "@wavesurfer/react";
import dayjs from "dayjs";
import Markdown from "markdown-to-jsx";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css"; //Example style, you can use another
import { useState } from "react";
import { Controller } from "react-hook-form";
import Editor from "react-simple-code-editor";
import WaveSurfer from "wavesurfer.js";
import { SSMLHighlighter } from "../ssml-highlighter";

export const SpeechScriptEdit = () => {
  const [saved, setSaved] = useState(false);

  const {
    saveButtonProps,
    refineCore: { query, formLoading },
    formState: { errors, dirtyFields },
    getValues,
    register,
    control,
    resetField,
    watch,
  } = useForm<ISpeechScript, HttpError, ISpeechScript>({
    defaultValues: {
      ssml: "",
      status: "Draft",
    },
    refineCoreProps: {
      onMutationSuccess: () => {
        resetField("ssml");
      },
    },
  });

  const record = query?.data?.data;

  const [loading, setLoading] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const handleTTS = async () => {
    try {
      setLoading(true);
      setAudioUrl(null);

      // Use the Google TTS API to generate speech
      const response = await fetch("/api/v1/tts-google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: getValues("ssml") }),
      });
      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error || "Failed to generate speech");
      }

      // Prepare the audio URL from the response
      const data = await response.json();
      if (data.url) {
        // delay 2 seconds
        setAudioUrl(data.url);
      }
    } catch (error) {
      alert("Failed to generate speech, " + error);
    } finally {
      setLoading(false);
    }
  };

  const [wavesurfer, setWavesurfer] = useState<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const refno = watch("refno");
  const revision = watch("revision");
  const updated_at = watch("updated_at");

  return (
    <Edit
      saveButtonProps={{ ...saveButtonProps, startIcon: <Check /> }}
      footerButtonProps={{ sx: { p: 2, justifyContent: "flex-start" } }}
      isLoading={formLoading}
    >
      <Box
        component="form"
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        autoComplete="off"
      >
        <Box>
          <Typography variant="body1">Page: {refno}</Typography>
          <Typography variant="body1">Revision: {revision}</Typography>
        </Box>
        <Box>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <TextField
                {...field}
                sx={{ width: 200 }}
                margin="normal"
                InputLabelProps={{ shrink: true }}
                type="text"
                label="Status"
                select
              >
                {SpeechScriptStatus.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name}
                  </MenuItem>
                ))}
              </TextField>
            )}
          />
        </Box>

        <Box>
          <Box mb={1} display="flex" gap={1} alignItems="center">
            {["weak", "strong", "x-strong", "1s"].map((tag) => (
              <Button
                key={tag}
                variant="outlined"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `<break ${tag === "1s" ? "time" : "strength"}="${tag}"/>`
                  );
                }}
                startIcon={<ContentCopy />}
              >
                {tag} Break
              </Button>
            ))}
            <Typography variant="body2">
              <a
                href="https://github.com/fabiancelik/rich-voice-editor/wiki/SSML-Tags-and-Functions"
                target="ssml"
              >
                SSML Reference
              </a>
            </Typography>
          </Box>

          <Controller
            name="ssml"
            control={control}
            render={({ field: { value, onChange, name } }) => (
              <Editor
                name={name}
                value={value}
                onValueChange={(value) => {
                  onChange(value);
                }}
                highlight={(code) =>
                  Prism.highlight(code, Prism.languages.ssml, "ssml")
                }
                padding={10}
                style={{
                  borderRadius: 5,
                  border: "1px solid gray",
                  fontFamily: '"Fira code", "Fira Mono", monospace',
                }}
                placeholder="Type some content here..."
              />
            )}
          />
          {dirtyFields.ssml && (
            <Chip label="unsaved" color="error" size="small" sx={{ my: 1 }} />
          )}
          <Typography variant="body2" color="error">
            {errors.ssml?.message as string}
          </Typography>
        </Box>
        <Box display="flex" gap={1}>
          <LoadingButton
            variant="contained"
            color="primary"
            onClick={() => handleTTS()}
            loading={loading}
          >
            Generate Audio
          </LoadingButton>
          <Button
            {...saveButtonProps}
            variant={dirtyFields.ssml ? "contained" : "outlined"}
          >
            Save
          </Button>
        </Box>
        {audioUrl && (
          <Box>
            <WavesurferPlayer
              height={100}
              width="100%"
              waveColor="lightgray"
              url={audioUrl}
              onReady={(wavesurfer) => {
                setWavesurfer(wavesurfer);
                setIsPlaying(false);
              }}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                onClick={() => {
                  wavesurfer?.playPause();
                }}
                startIcon={isPlaying ? <Pause /> : <PlayArrow />}
              >
                {isPlaying ? "Pause" : "Play"}
              </Button>
              <a
                href={audioUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outlined" startIcon={<Download />}>
                  Download
                </Button>
              </a>
            </Box>
          </Box>
        )}
        <Paper sx={{ p: 2 }} variant="outlined">
          <Typography variant="body2">Original Script</Typography>
          <Markdown style={{ color: "text.secondary" }}>
            {record?.original || "--"}
          </Markdown>
        </Paper>
        <Paper sx={{ p: 2 }} variant="outlined">
          <Typography variant="body2">Previous SSML</Typography>
          {record?.ssml ? (
            <SSMLHighlighter ssml={record.ssml} />
          ) : (
            <Typography variant="body2" color="text.secondary">
              No SSML available
            </Typography>
          )}
        </Paper>
        <Box>
          <Typography variant="body2">
            Updated At: {dayjs(updated_at).format(DAYJS_FORMAT)}
          </Typography>
        </Box>
      </Box>
      <Snackbar
        open={saved}
        onClose={() => setSaved(false)}
        autoHideDuration={2000}
        message="Autosaved"
      />
    </Edit>
  );
};
