Adapted from The Fix Wizard's homepage "How It Works" section — a step-by-step process walkthrough where every step crossfades three things together: the background gradient behind the section, the heading/description text, and a phone-mockup visual showing what that step looks like on a customer's phone.

One `goTo(index)` function keeps three independent crossfades in lockstep:

1. **Background** — two full-bleed layers (`data-layer="a"`/`"b"`) are stacked on top of each other and only one is ever visible. Moving to a new step paints the *hidden* layer with the next gradient, fades it in, fades the old one out, then flips which layer is hidden for next time — this sidesteps trying to transition a `background` property directly, which doesn't animate smoothly between arbitrary gradients.
2. **Text** — the heading and description each sit inside an `overflow: hidden` mask. A `visible`/`exiting` class pair slides the text up and out, swaps its `textContent` while it's off-screen, resets the transform with `transition: none` so the reset itself is invisible, then re-adds `visible` on the next frame so it slides back in from below instead of just popping into place.
3. **Visual** — every step's phone content is pre-rendered as a `.ssw-slide`, stacked absolutely inside `.ssw-visual-col`. Only the one with `.active` has `opacity: 1` and receives pointer events, so switching steps is just moving that class.

Call `createStepShowcase(rootEl, steps)` with an array of `{ badge, heading, desc, color, bg, screenHTML }` objects. `screenHTML` is any HTML string — a message bubble, an invoice card, a settings screen, or nothing but an icon — so wrap it in `.ssw-phone` / `.ssw-screen` for the bezel-and-notch device frame, or skip that markup entirely for a plain crossfading illustration instead of a phone.

Navigation works three ways: the prev/next buttons, clicking a dot directly, and the left/right arrow keys once the component has focus.
