# Changelog

## [0.5.0](https://github.com/stoatx-ts/stoatx/compare/client-v0.4.0...client-v0.5.0) (2026-06-07)


### Features

* add serverBanAdd and serverMemberKick events ([#65](https://github.com/stoatx-ts/stoatx/issues/65)) ([e61c556](https://github.com/stoatx-ts/stoatx/commit/e61c556e25970e9ce8e4b35168f8da1c9a5b16d8))
* add unit tests ([#67](https://github.com/stoatx-ts/stoatx/issues/67)) ([f092c0f](https://github.com/stoatx-ts/stoatx/commit/f092c0febed72d043bbd8cabbd26fcd15a1bbaca))


### Bug Fixes

* firehose raw events so they always show up ([#63](https://github.com/stoatx-ts/stoatx/issues/63)) ([9c8fdd2](https://github.com/stoatx-ts/stoatx/commit/9c8fdd289e661c1476409763d1d5f4c02997f0dc))

## [0.4.0](https://github.com/stoatx-ts/stoatx/compare/client-v0.3.0...client-v0.4.0) (2026-06-06)


### Features

* add role icons and create helper methods ([#61](https://github.com/stoatx-ts/stoatx/issues/61)) ([9400bcf](https://github.com/stoatx-ts/stoatx/commit/9400bcf4ffc4bfa64a1f8e6c13be517a842746b7))
* create AttachmentBuilder.ts and update methods to use it ([#62](https://github.com/stoatx-ts/stoatx/issues/62)) ([01cd789](https://github.com/stoatx-ts/stoatx/commit/01cd789956b33bcebe605368f0fb1362616c4bfb))
* rewrite permissions ([#59](https://github.com/stoatx-ts/stoatx/issues/59)) ([67c521b](https://github.com/stoatx-ts/stoatx/commit/67c521b22243ae421bc328a9d95dc45f90c54bc4))

## [0.3.0](https://github.com/stoatx-ts/stoatx/compare/client-v0.2.2...client-v0.3.0) (2026-05-29)


### Features

* add emoji management and reaction ([#51](https://github.com/stoatx-ts/stoatx/issues/51)) ([3119b4a](https://github.com/stoatx-ts/stoatx/commit/3119b4a5ffd0e039af4c1d40100e97c233335ebd))
* add more methods to member structure ([#45](https://github.com/stoatx-ts/stoatx/issues/45)) ([dd0ea64](https://github.com/stoatx-ts/stoatx/commit/dd0ea64f9c5d45f337bdc8a1a2453fb87dcf2d2e))
* add reaction methods ([#50](https://github.com/stoatx-ts/stoatx/issues/50)) ([670c47f](https://github.com/stoatx-ts/stoatx/commit/670c47fd75e5eb3064d4fb9a1a8fb4dad54a11c1))
* add several methods to channels to improve DX ([#47](https://github.com/stoatx-ts/stoatx/issues/47)) ([07a4bc0](https://github.com/stoatx-ts/stoatx/commit/07a4bc07e39ca9847da078c36989737013fc9d26))
* add several methods to improve DX ([#48](https://github.com/stoatx-ts/stoatx/issues/48)) ([839d3b7](https://github.com/stoatx-ts/stoatx/commit/839d3b7451f0827c1565c50740174213ef53b5c2))
* implement collectors ([#49](https://github.com/stoatx-ts/stoatx/issues/49)) ([af6f498](https://github.com/stoatx-ts/stoatx/commit/af6f4985c0a597cd70efb702820d8dce493038ef))

## [0.2.2](https://github.com/stoatx-ts/stoatx/compare/client-v0.2.1...client-v0.2.2) (2026-05-25)


### Bug Fixes

* update client property visibility in multiple managers ([#41](https://github.com/stoatx-ts/stoatx/issues/41)) ([13a24cf](https://github.com/stoatx-ts/stoatx/commit/13a24cf29f2e1029b6dc9d0bfa0dcd0f212fad1c))

## [0.2.1](https://github.com/stoatx-ts/stoatx/compare/client-v0.2.0...client-v0.2.1) (2026-05-23)


### Bug Fixes

* force version bump to sync workspace ([#38](https://github.com/stoatx-ts/stoatx/issues/38)) ([d7394b2](https://github.com/stoatx-ts/stoatx/commit/d7394b2f36f9d9e0c0ea5fd6394d853b370e0692))

## [0.2.0](https://github.com/stoatx-ts/stoatx/compare/client-v0.1.1...client-v0.2.0) (2026-05-23)


### Features

* add member structure functions ([#34](https://github.com/stoatx-ts/stoatx/issues/34)) ([fc82b27](https://github.com/stoatx-ts/stoatx/commit/fc82b270a5a59e502bf9a0a847d3810f14ebf128))


### Bug Fixes

* correct property name from 'relation' to 'relationship' in GatewayManager ([#36](https://github.com/stoatx-ts/stoatx/issues/36)) ([4e29e62](https://github.com/stoatx-ts/stoatx/commit/4e29e625444f91dfd2599f262abb1ddcf121b1e2))
* make client field protected and non-enumerable in BaseManager ([#31](https://github.com/stoatx-ts/stoatx/issues/31)) ([9966bad](https://github.com/stoatx-ts/stoatx/commit/9966bad6dadee19d6d779d29cca6942887798ddd))

## [0.1.1](https://github.com/stoatx-ts/stoatx/compare/client-v0.1.0...client-v0.1.1) (2026-05-20)


### Bug Fixes

* implement custom StoatAPIError class for improved error handling ([#27](https://github.com/stoatx-ts/stoatx/issues/27)) ([3ddb71a](https://github.com/stoatx-ts/stoatx/commit/3ddb71a1d50d5dbec87c24f3d17cf56aa9c57f34))
* remove debug log for timestamp in Message.ts ([#26](https://github.com/stoatx-ts/stoatx/issues/26)) ([2698a95](https://github.com/stoatx-ts/stoatx/commit/2698a9591896bec30c1d741bea9c612e39df00a5))
* update fetch method to use correct URL for member retrieval ([#24](https://github.com/stoatx-ts/stoatx/issues/24)) ([63b48a1](https://github.com/stoatx-ts/stoatx/commit/63b48a14c16b8d887c03aebcf0f87e0309b6a443))

## [0.1.0](https://github.com/stoatx-ts/stoatx/compare/client-v0.0.1...client-v0.1.0) (2026-05-13)


### Features

* write own library for bots from scratch ([#19](https://github.com/stoatx-ts/stoatx/issues/19)) ([32c3977](https://github.com/stoatx-ts/stoatx/commit/32c397720beeaea4c8742c0ef2dbf0f21f52f770))
