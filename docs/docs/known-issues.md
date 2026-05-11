---
sidebar_position: 6
title: Known issues
---

# Known issues

## Cropper size in modals

If the cropper is inside a modal, avoid opening animations that change modal dimensions, especially scale animations.

Fade or slide animations are fine. Scale animations can make the cropper measure the wrong size.

Related issues:

- [#428](https://github.com/ValentinH/react-easy-crop/issues/428)
- [#409](https://github.com/ValentinH/react-easy-crop/issues/409)
- [#267](https://github.com/ValentinH/react-easy-crop/issues/267)
- [#400](https://github.com/ValentinH/react-easy-crop/issues/400)

## Fixed crop size

`cropSize` is available, but `aspect` is usually the better API. Fixed crop dimensions make responsive layouts harder and are easy to get wrong.

Use `cropSize` only when the crop UI must match exact pixel dimensions.
