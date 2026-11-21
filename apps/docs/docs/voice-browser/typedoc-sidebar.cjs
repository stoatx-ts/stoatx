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
          id: "../docs/voice-browser/classes/VoiceConnection",
          label: "VoiceConnection"
        },
        {
          type: "doc",
          id: "../docs/voice-browser/classes/VoiceManager",
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
          id: "../docs/voice-browser/interfaces/BrowserVoiceConnectionEvents",
          label: "BrowserVoiceConnectionEvents"
        },
        {
          type: "doc",
          id: "../docs/voice-browser/interfaces/BrowserVoiceOptions",
          label: "BrowserVoiceOptions"
        },
        {
          type: "doc",
          id: "../docs/voice-browser/interfaces/VoiceConnectionEvents",
          label: "VoiceConnectionEvents"
        }
      ]
    },
    {
      type: "category",
      label: "Type Aliases",
      items: [
        {
          type: "doc",
          id: "../docs/voice-browser/type-aliases/VoiceChannelResolvable",
          label: "VoiceChannelResolvable"
        },
        {
          type: "doc",
          id: "../docs/voice-browser/type-aliases/VoiceConnectionStatus",
          label: "VoiceConnectionStatus"
        }
      ]
    }
  ]
};
module.exports = typedocSidebar.items;