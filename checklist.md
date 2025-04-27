# Web Component Accessibility Checklist for VoiceOver Testing

A manual checklist to help test the accessibility of your carousel component using VoiceOver on macOS.

## VoiceOver Basics

First, make sure you know how to operate VoiceOver:

- Turn VoiceOver on/off: Cmd + F5
- VoiceOver modifier key (VO): Control + Option
- Navigate next item: VO + Right Arrow
- Navigate previous item: VO + Left Arrow
- Interact with an element: VO + Space
- Stop interacting: VO + Shift + Space

## Carousel Accessibility Checklist

### 1. Initial Focus and Identification
- Turn on VoiceOver and navigate to the carousel
- VoiceOver should announce something like "carousel, region" (due to `role="region"` and `aria-roledescription="carousel"`)
- You should hear information about how many slides are available

### 2. Slide Navigation
- Navigate to the Previous/Next buttons
- VoiceOver should announce "Previous Slide, button" and "Next Slide, button"
- Press one of these buttons
- VoiceOver should announce the new slide (e.g., "Slide 2 of 3")

### 3. Keyboard Navigation
- Put focus on the carousel
- Press Left/Right arrow keys
- VoiceOver should announce the slide change
- The Live Region should automatically announce the slide changes

### 4. Image Content Accessibility
- Ensure each image has proper alt text
- VoiceOver should read this alt text when focusing on each slide

### 5. Autoplay Feature (if enabled)
- When autoplay is active, verify that VoiceOver announces each new slide
- Ensure autoplay pauses when interacting with the carousel

### 6. ARIA States
- Check that the current slide is properly identified (with `aria-hidden="false"`)
- Hidden slides should have `aria-hidden="true"`

### 7. Tab Order
- Press the Tab key repeatedly
- Verify focus moves logically from the carousel to Previous button to Next button

## Expected VoiceOver Announcements

1. **When focusing on the carousel**:
   "Carousel, region, Slide X of Y"

2. **When focusing on navigation buttons**:
   "Previous Slide, button" or "Next Slide, button"

3. **After changing slides**:
   "Slide X of Y"

4. **When focusing on an image**:
   "[Alt text of the image], image, X of Y"

## Troubleshooting Tips

If VoiceOver isn't announcing slide changes:

- Check that `ariaLive="polite"` and `ariaAtomic="true"` are properly set on the element internals
- Ensure the `aria-label` is being updated with the current slide information
- Verify that proper ARIA roles are assigned to each element

Based on the code I've seen, your carousel component is set up with these accessibility features, but manual testing is essential to ensure they're working as expected in practice. The critical elements are already in place in your implementation, including ARIA live regions, proper roles, and keyboard navigation.