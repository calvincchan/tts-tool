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
import { useState } from "react";
import { Controller } from "react-hook-form";
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
      markup: "",
      status: "Draft",
    },
    refineCoreProps: {
      onMutationSuccess: () => {
        resetField("markup");
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
      const response = await fetch("/api/v1/tts-google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: getValues("markup") }),
      });
      if (!response.ok) {
        alert(
          "1 Failed to generate speech, error message: " + response.statusText
        );
      }
      const data = await response.json();
      if (data.url) {
        // delay 2 seconds
        setAudioUrl(data.url);
      }
    } catch (error) {
      alert("2 Failed to generate speech, error message: " + error);
      console.error("Error generating speech:", error);
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
            {["pause short", "pause", "pause long"].map((tag) => (
              <Button
                key={tag}
                variant="outlined"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `[${tag}]`
                  );
                }}
                startIcon={<ContentCopy />}
              >
                [{tag}]
              </Button>
            ))}
            <Typography variant="body2">
              <a
                href="https://cloud.google.com/text-to-speech/docs/chirp3-hd#pause_control"
                target="doc"
              >
                Pause Control
              </a>
            </Typography>
          </Box>

          <Controller
            name="markup"
            control={control}
            render={({ field: { value, onChange, name } }) => (
              <TextField
                name={name}
                id="outlined-multiline-static"
                label="Content"
                multiline
                rows={24}
                value={value}
                onChange={(e) => {
                  onChange(e.target.value);
                }}
                fullWidth
                variant="outlined"
                placeholder="Type some content here..."
              />
            )}
          />
          {dirtyFields.markup && (
            <Chip label="unsaved" color="error" size="small" sx={{ my: 1 }} />
          )}
          <Typography variant="body2" color="error">
            {errors.markup?.message as string}
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
            variant={dirtyFields.markup ? "contained" : "outlined"}
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
