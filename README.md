# ALBERT.T Productions - Website (Draft 1)

This is a static, multi-page website for ALBERT.T Productions (ALBERT.T ENTERPRISE), a film, video and media studio in Kota Kinabalu, Sabah. It needs no build step and no framework. Upload it to GitHub and it runs as is.

## Pages
| File | Page |
|---|---|
| `index.html` | Home: hero, about statement, services, a selected-work coverflow, process, clients, testimonials and a call to action |
| `about.html` | Company overview, values, timeline and an on-set mosaic |
| `services.html` | Video, Photo and Drone services, production types and FAQ |
| `work.html` | Portfolio grid with filters and a video pop-up |
| `contact.html` | Contact cards, a map, and an enquiry form that opens in WhatsApp or email |
| `404.html` | Custom "That's a wrap" error page |

## Publish on GitHub Pages
1. Create a new repository on GitHub, for example `albert-t-productions`.
2. Upload **everything inside this folder**. `index.html` must sit at the top level of the repository.
3. In the repository, go to **Settings → Pages**.
4. Under "Build and deployment", set the source to **Deploy from a branch**. Choose the `main` branch and the `/ (root)` folder, then click Save.
5. Wait about a minute. The site will be live at `https://<your-username>.github.io/albert-t-productions/`.

To use a custom domain such as `albertt.my`, enter it under Settings → Pages → Custom domain. Then point your domain's DNS records to GitHub Pages.

## Brand system
**Colours**
| Token | Hex | Use |
|---|---|---|
| Cinema Black | `#0A0A0B` | Dark mode background and inverted text |
| Warm Paper | `#F3F0EA` | Light mode background |
| Tally Orange | `#FF5A1F` | Primary accent: the record-light dot, buttons and highlights |
| Golden Amber | `#FFB23F` | Glows and light-streak gradients |
| Ash | `#A3A099` / `#5F5D57` | Muted text (dark and light modes) |

**Fonts** are self-hosted and free under the SIL Open Font License.
- **Bricolage Grotesque** is used for headlines and titles.
- **Hanken Grotesk** is used for body text and the user interface.
- **Instrument Serif Italic** is used for one accent word in the big headlines.
- **DM Mono** is used for small labels, timecode and the camera HUD details.
- **Archivo** is used only for the logo wordmark (the two `*-outline` files are static copies used for the outlined text).

**Logo**: The logo is a typographic wordmark, `ALBERT●T`. The dot between the words is a blinking orange "REC" light.

## Things to replace before launch
- **Showreel and project videos**: every play button opens a pop-up. To show a real video, upload it to YouTube and paste its video ID into the `data-video=""` attribute. For example, `data-video="dQw4w9WgXcQ"`. Until then, the pop-up shows a "Coming soon" card.
- **Client logos** (Home page): the 28 logos from the company profile are in `assets/img/clients/`. They are listed in the order of the profile. To add or remove one, edit the `logos__track` rows in `index.html`.
- **Social links**: the Instagram and Facebook icons currently link to `#`. Search the pages for `aria-label="Instagram"` and `aria-label="Facebook"` and add the real URLs.
- **Photos**: these are free stock photos from Unsplash (see the list below). Swap them for Albert's own shots when they are ready. Search for `images.unsplash.com/photo-...` in the HTML, or save the images in `assets/img/` and point to them there.
- **Testimonials**: the three quotes come from the company profile. Add the clients' names or companies when you have their permission.

## Stock photography (Unsplash licence: free for commercial use, no attribution required)
| Used for | Unsplash photo |
|---|---|
| Home hero | unsplash.com/photos/FtQE89f3EXA |
| Corporate / interview | unsplash.com/photos/KieCLNzKoBo |
| Commercial / light beams | unsplash.com/photos/kbd1oAf-9Ms |
| About banner / crew | unsplash.com/photos/QMa2FvZRoF0 |
| Event camera operator | unsplash.com/photos/kaOkKC5ehoE |
| Concert stage | unsplash.com/photos/8jJ-Bw7c_d4 |
| Conference hall | unsplash.com/photos/pzwF2j9aYxk |
| Wedding | unsplash.com/photos/xMDo8y776uE |
| KK sunset waterfront | unsplash.com/photos/RCDNI5TBPDo |
| Mount Kinabalu | unsplash.com/photos/JXphbLClTbc |
| Reef aerial | unsplash.com/photos/8dpauxH2_r4 |
| Drone | unsplash.com/photos/XYrjl3j7smo |
| Real estate dusk | unsplash.com/photos/cUoXTLVFQ9M |
| Camera rig / monitor | unsplash.com/photos/I-nd-LSCY04 |
| Photographer | images.unsplash.com/photo-1492691527719-9d1e07e534b4 |

## Features
- Mobile-first, responsive layout, tested at 360, 390, 768 and 1440 px widths
- Dark and light modes. The site starts in dark mode, remembers the visitor's choice, and animates the switch
- Shutter-style page transitions, scroll reveals, line-by-line headline reveals and a statement that lights up word by word as you scroll
- Light-streak motion in the hero, a live 24 fps timecode, a ticker and marquee, a custom cursor, magnetic buttons and tilt cards
- Swipeable 3D coverflow with filters, a portfolio filter, a testimonial slider and an FAQ accordion
- The enquiry form builds a ready-to-send WhatsApp message or email. Dates use the DD/MM/YY format
- The footer shows the local time in Kota Kinabalu in 12-hour format
- Accessibility: a skip link, visible focus states, labelled controls and keyboard navigation. Motion is reduced when the visitor's device asks for it
- SEO: page titles and meta descriptions, Open Graph tags, and LocalBusiness structured data on the Home page
- Typography rule: no paragraph or heading ends with a lone word on its last line. The script keeps at least three words on the last line of every text block

## Custom domain
The site is served at `alberttproductions.com` (see the `CNAME` file). DNS lives at Porkbun: four `A` records for the apex pointing to GitHub Pages (185.199.108.153, .109.153, .110.153, .111.153) and a `CNAME` for `www` pointing to `raziealfiedan.github.io`. In GitHub, Settings, Pages, keep "Enforce HTTPS" ticked.
