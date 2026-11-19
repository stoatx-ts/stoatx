# Class: AttachmentBuilder

## Constructors

### Constructor

> **new AttachmentBuilder**(`file`, `filename?`): `AttachmentBuilder`

Creates a new AttachmentBuilder with the given file and optional filename.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `file` | [`AttachmentData`](../type-aliases/AttachmentData.md) | The file data as a Blob, ArrayBuffer, typed array or Node Buffer. |
| `filename?` | `string` | An optional filename to use for the uploaded file. If not provided, the CDN will assign a default name. Providing a filename can help with organization and debugging, but is not strictly required. |

#### Returns

`AttachmentBuilder`

#### Examples

```ts
// Create an attachment from a Buffer with a custom filename
const buffer = Buffer.from("Hello, world!");
const attachment = new AttachmentBuilder(buffer, "greeting.txt");
```

```ts
// In a browser, pass a File from an <input type="file"> directly (a File is a Blob)
const file = input.files[0];
const attachment = new AttachmentBuilder(file, file.name);
```

## Properties

### file

> `readonly` **file**: [`AttachmentData`](../type-aliases/AttachmentData.md)

***

### filename

> `readonly` **filename**: `string` \| `undefined` = `undefined`
