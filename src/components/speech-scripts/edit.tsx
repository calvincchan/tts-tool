"use client";

import { ISpeechScript, SpeechScriptStatus } from "@interfaces/type";
import { Check, Download, Pause, PlayArrow } from "@mui/icons-material";
import { LoadingButton } from "@mui/lab";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { HttpError } from "@refinedev/core";
import { Edit } from "@refinedev/mui";
import { useForm } from "@refinedev/react-hook-form";
import { DAYJS_FORMAT } from "@utils/constants";
import WavesurferPlayer from "@wavesurfer/react";
import dayjs from "dayjs";
import Markdown from "markdown-to-jsx";
import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css"; //Example style, you can use another
import { useEffect, useMemo, useState } from "react";
import { Controller } from "react-hook-form";
import Editor from "react-simple-code-editor";
import WaveSurfer from "wavesurfer.js";

export const SpeechScriptEdit = () => {
  const [saved, setSaved] = useState(false);

  const {
    saveButtonProps,
    refineCore: { query, formLoading },
    formState: { errors, dirtyFields, isDirty: _isDirty },
    getValues,
    register,
    control,
  } = useForm<ISpeechScript, HttpError, ISpeechScript>({
    defaultValues: {
      content: "",
      status: "Draft",
    },
  });

  const isDirty = useMemo(() => !!dirtyFields.content, [dirtyFields]);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        event.preventDefault();
        event.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const record = query?.data?.data;

  useEffect(() => {
    if (!register) return;
    register("refno");
    register("revision");
    register("content");
    register("updated_at");
    register("status");
  }, [register]);

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
        body: JSON.stringify({ ssml: getValues("content") }),
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
          <Typography variant="body1">Page: {getValues("refno")}</Typography>
          <Typography variant="body1">
            Revision: {getValues("revision")}
          </Typography>
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

        <Paper
          variant="outlined"
          sx={{
            borderColor: dirtyFields.content ? "salmon" : "primary.main",
            borderWidth: 2,
          }}
        >
          <Controller
            name="content"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Editor
                value={value}
                onValueChange={(value) => {
                  setAudioUrl(null);
                  onChange(value);
                }}
                highlight={(code) =>
                  Prism.highlight(code, Prism.languages.ssml, "ssml")
                }
                padding={10}
                placeholder="Type some SSML here..."
              />
            )}
          />
          <Typography variant="body2" color="error">
            {errors.content?.message as string}
          </Typography>
        </Paper>
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
            startIcon={<Check />}
            variant={dirtyFields.content ? "contained" : "outlined"}
          >
            Save
          </Button>{" "}
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
        <Box>
          <Typography variant="body2">
            Updated At: {dayjs(record?.updated_at).format(DAYJS_FORMAT)}
          </Typography>
          <Typography variant="body2">
            Created At: {dayjs(record?.created_at).format(DAYJS_FORMAT)}
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
