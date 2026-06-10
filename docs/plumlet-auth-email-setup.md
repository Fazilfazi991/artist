# Plumlet Auth Email Setup

Goal: Supabase Auth emails should come from Plumlet, using a verified sender on `plumlet.in`.

## Recommended Sender

- Sender name: `Plumlet`
- From email: `no-reply@plumlet.in`
- Reply-to email: `support@plumlet.in` or `hello@plumlet.in`

For better deliverability, keep authentication mail separate from marketing mail. If possible, use `no-reply@auth.plumlet.in` instead of the root domain sender.

## What Must Be Configured In Supabase

Open Supabase Dashboard:

1. Go to `Authentication` -> `Emails` or `SMTP Settings`.
2. Enable custom SMTP.
3. Enter the SMTP provider values:
   - SMTP host
   - SMTP port, usually `587`
   - SMTP username
   - SMTP password/API key
   - Sender email: `no-reply@plumlet.in`
   - Sender name: `Plumlet`
4. Go to URL configuration:
   - Site URL: `https://plumlet.in`
   - Redirect URLs:
     - `https://plumlet.in/auth/callback`
     - `https://www.plumlet.in/auth/callback` if `www` is enabled
     - Local dev only if needed: `http://127.0.0.1:3001/auth/callback`
5. Save and send a test signup confirmation email.

## DNS Records Needed

Your SMTP provider will give exact DNS records. Add them at the DNS host for `plumlet.in`.

Common records:

- SPF TXT record
- DKIM CNAME or TXT records
- DMARC TXT record
- Optional bounce/return-path CNAME

Suggested starter DMARC record:

```txt
Name: _dmarc
Type: TXT
Value: v=DMARC1; p=none; rua=mailto:postmaster@plumlet.in; adkim=s; aspf=s
```

After mail is verified and stable, DMARC can move from `p=none` to `p=quarantine`, then `p=reject`.

## Supabase Confirmation Template

Subject:

```txt
Confirm your Plumlet email
```

HTML:

```html
<div style="margin:0;background:#ffffff;padding:0;font-family:Arial,Helvetica,sans-serif;color:#241124;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#ffffff;margin:0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;border:1px solid #F7A1B5;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="background:#69296A;padding:28px 28px 22px;text-align:center;color:#ffffff;">
              <div style="font-size:30px;font-weight:800;letter-spacing:.01em;">Plumlet</div>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 28px;">
              <h1 style="margin:0 0 12px;font-size:24px;line-height:1.25;color:#241124;">Confirm your email address</h1>
              <p style="margin:0 0 22px;font-size:15px;line-height:1.7;color:#602060;">
                Please confirm your email address to finish creating your Plumlet account.
              </p>
              <p style="margin:0 0 26px;">
                <a href="{{ .ConfirmationURL }}" style="display:inline-block;background:#69296A;color:#ffffff;text-decoration:none;font-weight:800;border-radius:12px;padding:14px 22px;">
                  Confirm email
                </a>
              </p>
              <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#602060;">
                If the button does not work, copy and paste this link into your browser:
              </p>
              <p style="margin:0;word-break:break-all;font-size:12px;line-height:1.6;color:#69296A;">
                {{ .ConfirmationURL }}
              </p>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #F7A1B5;padding:18px 28px;font-size:12px;line-height:1.6;color:#602060;">
              If you did not request this email, you can ignore it.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</div>
```

## Management API Option

Supabase also supports configuring Auth SMTP through the Management API. To do that safely, the operator needs:

- Supabase access token from the Supabase account dashboard
- Project ref: `mkeskzxmisuwsxsvfrax`
- SMTP host, port, username, and password/API key
- Verified sender email

Do not commit those values to git.
