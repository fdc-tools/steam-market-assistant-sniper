# SMA Sniper — Steam Market Assistant

A Chrome extension that instantly opens the buy dialog for a specific Steam Market listing by navigating directly to it via URL parameters. If the listing isn't on the requested page, it automatically searches adjacent pages.

## How it works

Open any Steam Market listings page and add these URL parameters:

```
https://steamcommunity.com/market/listings/{appid}/{item_name}?page=N&listingid=XXXXXXXXXXXXXXX
```

| Parameter   | Required | Description                                          |
|-------------|----------|------------------------------------------------------|
| `page`      | Yes      | The page number where the listing is expected        |
| `listingid` | Yes      | The Steam listing ID to find and click               |
| `count`     | No       | Items per page (default: `10`)                       |

### Search order

The extension searches pages in this order: `page` → `page - 1` → `page + 1`

A status indicator is shown in the bottom-right corner while searching.

## Installation

### From the Chrome Web Store

*(Coming soon)*

### Manual (Developer mode)

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked** and select the `src/` folder
5. The extension is now active on all Steam Market listing pages

## Example

```
https://steamcommunity.com/market/listings/730/AK-47%20%7C%20Redline%20%28Field-Tested%29?page=3&listingid=3854762891234567890&count=10
```

This will open the page, navigate to page 3, and automatically click **Buy** on listing `3854762891234567890`.

## Permissions

| Permission                              | Reason                                                        |
|-----------------------------------------|---------------------------------------------------------------|
| `host_permissions: steamcommunity.com`  | Required to inject the sniper script into Steam Market pages  |

No data is collected or sent anywhere. The extension only runs on Steam Market listing pages when `page` and `listingid` URL parameters are present.

## License

MIT — see [LICENSE](LICENSE)