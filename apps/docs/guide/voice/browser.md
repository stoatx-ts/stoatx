---
sidebar_position: 4
title: Voice in the Browser
---

# Voice in the Browser

`@stoatx/voice-browser` lets a web app join calls with the user's microphone and plays everyone else through the page. It's meant for user accounts; see [User Accounts](../user-accounts.md) for logging in.

```bash
npm install @stoatx/voice-browser
```

## Joining a call

```ts
import { VoiceManager } from "@stoatx/voice-browser";

const voice = new VoiceManager(client);
const connection = await voice.join(channel);
```

Other people's audio plays automatically through hidden `<audio>` elements added to `document.body`. To put them somewhere else, pass a container:

```ts
const voice = new VoiceManager(client, { audioContainer: document.querySelector("#call")! });
```

## Microphone

The microphone starts off, so joining never shows a permission prompt by itself. Turn it on when the user unmutes; the first time, the browser asks for permission:

```ts
muteButton.addEventListener("click", async () => {
  await connection.setMicrophoneEnabled(!connection.microphoneEnabled);
});
```

To use a specific microphone, pass its `deviceId` from `navigator.mediaDevices.enumerateDevices()`:

```ts
await connection.setMicrophoneEnabled(true, deviceId);
```

`setMicrophoneEnabled(true)` rejects if the user denies access.

## Deafening

`setDeafened()` mutes everyone else locally. It doesn't touch the microphone, so turn that off too for a full deafen:

```ts
connection.setDeafened(true);
await connection.setMicrophoneEnabled(false);
```

## Autoplay

Browsers block audio until the user has interacted with the page. If that happens, `canPlayAudio` is `false` and `audioPlaybackChange` fires. Ask the user to click, and start the audio from that click:

```ts
connection.on("audioPlaybackChange", (canPlay) => {
  enableAudioButton.hidden = canPlay;
});

enableAudioButton.addEventListener("click", () => connection.startAudio());
```

Joining from a click handler usually avoids this.

## Who's in the call

```ts
connection.participantIds; // user IDs of everyone else in the call

connection.on("participantJoin", (userId) => renderCall());
connection.on("participantLeave", (userId) => renderCall());

// Highlight whoever is talking, including the logged-in user
connection.on("activeSpeakersChange", (userIds) => highlightSpeakers(userIds));
```

## Leaving

```ts
await voice.leave(channel);
```

Leaving turns the microphone off and removes the audio elements.
