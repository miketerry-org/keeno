1. Use Shoelace
   What it is: A collection of accessible, framework-agnostic web components.
   Why it fits:

Built-in accessibility: Follows WAI-ARIA and WCAG guidelines
Pure web components → Easily used with server-rendered HTML (like handlebars)
Customizable theming, including dark/light mode toggle
Works with native HTML forms
Covers your needs:

Component Supported by Shoelace? Notes
Text input ✅ <sl-input> Fully accessible
Email input ✅ <sl-input type="email">
Combobox ✅ <sl-select> or <sl-combobox>
Checkbox ✅ <sl-checkbox>
Radio group ✅ <sl-radio-group> + <sl-radio>
Push button ✅ <sl-button>
Table ⚠️ Use native HTML Style with CSS or utility classes
Tabs ✅ <sl-tab-group>
Navbar ⚠️ Use custom layout Shoelace doesn’t include a full navbar, but you can use <sl-button> and other layout components
Dialog ✅ <sl-dialog>
Date picker ✅ <sl-date-picker>
Time picker/input ✅ <sl-input type="time"> or 3rd-party compatible
Dark/Light mode ✅ Built-in theme switching
Dark/light toggle example: Shoelace includes a theme switcher, or you can control it with JS.

2. Consider Adobe Spectrum Web Components (Advanced)
   If Shoelace doesn't fit all your visual needs or branding, Adobe Spectrum is another accessible-first library of web components.

High-quality accessibility (designed for Adobe users)
More “enterprise” and heavier than Shoelace
May require more setup/config
Use this if you need very strict Adobe-styled design systems, otherwise Shoelace is easier.

3. Use Native HTML + Accessible HTML Patterns
   If you want to avoid any components and write plain HTML, you can use:

WAI-ARIA Authoring Practices
Gov.uk Design System (great accessibility, form components)
But these approaches will require more work and custom styling.

🧩 Recommendation Summary

Option Ease of Use Accessibility Server Render Compatibility Customizability
Shoelace ✅ ⭐⭐⭐⭐ ✅ WCAG compliant ✅ Works with Express + Handlebars ⭐⭐⭐⭐
Spectrum Web Components ⭐⭐ ✅ ✅ ⭐⭐⭐⭐⭐
WAI-ARIA Patterns + Custom HTML ⭐ ✅ ✅ ⭐⭐⭐⭐⭐ (but manual)
🚀 Final Advice

Since you're not deep into CSS/JS frameworks and want great accessibility:

✅ Use Shoelace as your component library.
It’s accessible, minimal, and works great with server-rendered apps.
Let me know if you want a working Express/Handlebars page example using Shoelace — I can scaffold one for you.

Attach

Search

Voice

ChatGPT can make mistakes. Check important info.
Thanks for trying ChatGPT
Log in or sign up to get smarter responses, upload files and images, and more.

Log in

Sign up for free
Stay logged out
