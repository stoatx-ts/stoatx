import { useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { ActionIcon, FileButton, Group, Paper, Pill, Stack, Text, Textarea } from "@mantine/core";
import { Dropzone } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { IconPaperclip, IconSend, IconUpload } from "@tabler/icons-react";
import type { BaseChannel } from "@stoatx/client";
import { describeError } from "../../stoat/errors";
import { MAX_MESSAGE_LENGTH, sendMessage } from "../../stoat/messages";
import { useTypingNotifier } from "../../stoat/typing";

/**
 * Writing and sending a message: Enter sends, Shift+Enter adds a line. Files can be attached with
 * the paperclip, pasted, or dropped anywhere on the page.
 */
export function Composer({ channel, placeholder }: { channel: BaseChannel; placeholder: string }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const typing = useTypingNotifier(channel);
  const input = useRef<HTMLTextAreaElement>(null);

  const addFiles = (added: File[]) => {
    if (added.length > 0) setFiles((current) => [...current, ...added]);
  };

  async function send() {
    if (sending || (!text.trim() && files.length === 0)) return;
    const content = text;
    const attached = files;
    // Clear straight away; the message shows up in the list through `messageCreate`.
    setText("");
    setFiles([]);
    typing.stop();
    setSending(true);
    try {
      await sendMessage(channel, content, attached);
    } catch (error) {
      // Give the message back, so nothing is lost.
      setText(content);
      setFiles(attached);
      notifications.show({ color: "red", title: "Couldn't send the message", message: describeError(error) });
    } finally {
      setSending(false);
      input.current?.focus();
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    // isComposing: Enter confirms a word in input methods for e.g. Japanese; don't send then.
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send();
    }
  }

  function onPaste(event: ClipboardEvent<HTMLTextAreaElement>) {
    const pasted = [...event.clipboardData.files];
    if (pasted.length === 0) return; // Plain text: let the textarea handle it.
    event.preventDefault();
    addFiles(pasted);
  }

  return (
    <Stack gap={6}>
      <Dropzone.FullScreen onDrop={addFiles} activateOnClick={false}>
        <Stack align="center" justify="center" mih={200} gap="xs">
          <IconUpload size={48} stroke={1.5} />
          <Text size="lg">Drop files to attach them</Text>
        </Stack>
      </Dropzone.FullScreen>

      {files.length > 0 && (
        <Paper withBorder p="xs">
          <Pill.Group>
            {files.map((file, index) => (
              <Pill
                key={`${file.name}-${index}`}
                withRemoveButton
                onRemove={() => setFiles((current) => current.filter((_, i) => i !== index))}
              >
                {file.name}
              </Pill>
            ))}
          </Pill.Group>
        </Paper>
      )}

      <Textarea
        ref={input}
        placeholder={placeholder}
        aria-label={placeholder}
        autosize
        minRows={1}
        maxRows={8}
        maxLength={MAX_MESSAGE_LENGTH}
        value={text}
        onChange={(event) => {
          setText(event.currentTarget.value);
          if (event.currentTarget.value) typing.onInput();
          else typing.stop();
        }}
        onKeyDown={onKeyDown}
        onPaste={onPaste}
        onBlur={typing.stop}
        leftSection={
          <FileButton onChange={addFiles} multiple>
            {(props) => (
              <ActionIcon {...props} variant="subtle" color="gray" aria-label="Attach files">
                <IconPaperclip size={18} />
              </ActionIcon>
            )}
          </FileButton>
        }
        leftSectionPointerEvents="all"
        rightSection={
          <Group gap={4} wrap="nowrap">
            <ActionIcon
              variant="subtle"
              aria-label="Send"
              loading={sending}
              disabled={!text.trim() && files.length === 0}
              onClick={() => void send()}
            >
              <IconSend size={18} />
            </ActionIcon>
          </Group>
        }
        rightSectionPointerEvents="all"
      />
    </Stack>
  );
}
