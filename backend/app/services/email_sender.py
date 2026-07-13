import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from ..config import settings


async def send_email(
    recipient: str,
    subject: str,
    body: str,
    reply_to: str | None = None,
) -> str | None:
    smtp_host = settings.smtp_host or ""
    smtp_port = settings.smtp_port or 587
    smtp_user = settings.smtp_user or ""
    smtp_password = settings.smtp_password or ""

    if not smtp_host or not smtp_user:
        return "SMTP not configured"

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = smtp_user
    msg["To"] = recipient
    if reply_to:
        msg["Reply-To"] = reply_to

    msg.attach(MIMEText(body, "plain", "utf-8"))
    msg.attach(MIMEText(body.replace("\n", "<br>\n"), "html", "utf-8"))

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.starttls(context=context)
            server.login(smtp_user, smtp_password)
            server.sendmail(smtp_user, recipient, msg.as_string())
        return None
    except Exception as e:
        return str(e)
