# Class: AttachmentBuilder

## Constructors

### Constructor

> **new AttachmentBuilder**(`file`, `filename?`): `AttachmentBuilder`

Creates a new AttachmentBuilder with the given file and optional filename.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `file` | `Buffer`\<`ArrayBufferLike`\> \| `Blob` | The file data as a Buffer or Blob. |
| `filename?` | `string` | An optional filename to use for the uploaded file. If not provided, the CDN will assign a default name. Providing a filename can help with organization and debugging, but is not strictly required. |

#### Returns

`AttachmentBuilder`

#### Example

```ts
// Create an attachment from a Buffer with a custom filename
const buffer = Buffer.from("Hello, world!");
const attachment = new AttachmentBuilder(buffer, "greeting.txt");
```

## Properties

### file

> `readonly` **file**: `Buffer`\<`ArrayBufferLike`\> \| `Blob`

***

### filename

> `readonly` **filename**: `string` \| `undefined` = `undefined`
