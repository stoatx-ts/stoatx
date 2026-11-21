// @ts-check
/** @type {import("@docusaurus/plugin-content-docs").SidebarsConfig} */
const typedocSidebar = {
  items: [
    {
      type: "category",
      label: "Classes",
      items: [
        {
          type: "doc",
          id: "../docs/voice-node/classes/AudioPlayer",
          label: "AudioPlayer"
        },
        {
          type: "doc",
          id: "../docs/voice-node/classes/AudioResource",
          label: "AudioResource"
        },
        {
          type: "doc",
          id: "../docs/voice-node/classes/VoiceConnection",
          label: "VoiceConnection"
        },
        {
          type: "doc",
          id: "../docs/voice-node/classes/VoiceManager",
          label: "VoiceManager"
        }
      ]
    },
    {
      type: "category",
      label: "Interfaces",
      items: [
        {
          type: "doc",
          id: "../docs/voice-node/interfaces/AudioPlayerEvents",
          label: "AudioPlayerEvents"
        },
        {
          type: "doc",
          id: "../docs/voice-node/interfaces/AudioResourceOptions",
          label: "AudioResourceOptions"
        },
        {
          type: "doc",
          id: "../docs/voice-node/interfaces/VoiceConnectionEvents",
          label: "VoiceConnectionEvents"
        },
        {
          type: "doc",
          id: "../docs/voice-node/interfaces/VoiceJoinOptions",
          label: "VoiceJoinOptions"
        },
        {
          type: "doc",
          id: "../docs/voice-node/interfaces/VoiceNode",
          label: "VoiceNode"
        }
      ]
    },
    {
      type: "category",
      label: "Type Aliases",
      items: [
        {
          type: "doc",
          id: "../docs/voice-node/type-aliases/AudioPlayerStatus",
          label: "AudioPlayerStatus"
        },
        {
          type: "doc",
          id: "../docs/voice-node/type-aliases/AudioSource",
          label: "AudioSource"
        },
        {
          type: "doc",
          id: "../docs/voice-node/type-aliases/VoiceChannelResolvable",
          label: "VoiceChannelResolvable"
        },
        {
          type: "doc",
          id: "../docs/voice-node/type-aliases/VoiceConnectionStatus",
          label: "VoiceConnectionStatus"
        }
      ]
    }
  ]
};
module.exports = typedocSidebar.items;