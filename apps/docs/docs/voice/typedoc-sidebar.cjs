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
          id: "../docs/voice/classes/BaseVoiceConnection",
          label: "BaseVoiceConnection"
        },
        {
          type: "doc",
          id: "../docs/voice/classes/BaseVoiceManager",
          label: "BaseVoiceManager"
        }
      ]
    },
    {
      type: "category",
      label: "Interfaces",
      items: [
        {
          type: "doc",
          id: "../docs/voice/interfaces/VoiceConnectionEvents",
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
          id: "../docs/voice/type-aliases/VoiceChannelResolvable",
          label: "VoiceChannelResolvable"
        },
        {
          type: "doc",
          id: "../docs/voice/type-aliases/VoiceConnectionFactory",
          label: "VoiceConnectionFactory"
        },
        {
          type: "doc",
          id: "../docs/voice/type-aliases/VoiceConnectionStatus",
          label: "VoiceConnectionStatus"
        }
      ]
    }
  ]
};
module.exports = typedocSidebar.items;