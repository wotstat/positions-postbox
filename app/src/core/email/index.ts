
export type Email = {
  subject: string
  htmlBody: string
  textBody: string
}

type Options = {
  orderId: string
  datetime: Date
  quantity: number
  totalAmount: number
  paymentMethod: string
  keys: string[]
  receipt?: { id: string, url: string }
}

export function render(options: Options): Email {

  const subject = `Ваш лицензионный ключ – заказ №${options.orderId}`;
  const htmlBody = `<!doctype html>
<html lang="ru">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${subject}</title>
  </head>
  <body style="margin:0;padding:0;background:#f6f7f9;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#f6f7f9;">
      <tr>
        <td align="center" style="padding:24px 12px;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="width:600px;max-width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
            <tr>
              <td style="padding:20px 24px;background:#111827;color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
                <div style="font-size:16px;line-height:20px;opacity:.9;">WOTSTAT</div>
                <div style="font-size:22px;line-height:28px;font-weight:700;margin-top:6px;">
                  Позиции от WOTSTAT — лицензионный ключ
                </div>
                <div style="font-size:14px;line-height:20px;opacity:.9;margin-top:6px;">
                  Заказ №${options.orderId}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:24px;font-family:Arial,Helvetica,sans-serif;color:#111827;">
                <p style="margin:0 0 14px 0;font-size:16px;line-height:24px;">
                  Здравствуйте!
                </p>

                <p style="margin:0 0 18px 0;font-size:16px;line-height:24px;">
                  Спасибо за покупку <strong>Позиции</strong> от WOTSTAT.
                </p>

                <p style="margin:0 0 10px 0;font-size:16px;line-height:24px;">
                  <strong>Ваш лицензионный ключ:</strong>
                </p>

                <div style="margin:0 0 18px 0;padding:14px 16px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;font-family:Consolas,Menlo,Monaco,monospace;font-size:16px;line-height:22px;word-break:break-all;">
                  ${options.keys.map(k => `<div>${k}</div>`).join('')}
                </div>

                <p style="margin:0 0 10px 0;font-size:16px;line-height:24px;"><strong>Детали заказа:</strong></p>
                <div style="font-size:14px;line-height:22px;color:#374151;margin:0 0 18px 0;">
                  <div>— Номер: ${options.orderId}</div>
                  <div>— Дата: ${options.datetime}</div>
                  <div>— Сумма: ${options.totalAmount} ${'RUB'}</div>
                  <div>— Способ оплаты: ${options.paymentMethod}</div>
                </div>

                ${options.receipt ? `
                <p style="margin:0 0 10px 0;font-size:16px;line-height:24px;"><strong>Чек:</strong></p>
                <div style="font-size:14px;line-height:22px;color:#374151;margin:0 0 18px 0;">
                  <div>— Доступен по ссылке: <a href="${options.receipt.url}" style="color:#2563eb;text-decoration:underline;">${options.receipt.url}</a></div>
                </div>
                  ` : ''}

                <p style="margin:0 0 10px 0;font-size:16px;line-height:24px;"><strong>Как активировать:</strong></p>
                <ol style="margin:0 0 18px 18px;padding:0;font-size:14px;line-height:22px;color:#374151;">
                  <li style="margin:0 0 6px 0;">Скачайте и установите мод: <a href="https://ru.wotstat.info/install?preset=positions" style="color:#2563eb;text-decoration:underline;">ru.wotstat.info/install</a></li>
                  <li style="margin:0 0 6px 0;">Запустите игру и в уведомлении нажмите кнопку "активировать"</li>
                  <li style="margin:0 0 6px 0;">Вставьте ключ и подтвердите активацию.</li>
                </ol>

                <p style="margin:0 0 10px 0;font-size:16px;line-height:24px;"><strong>Важно:</strong></p>
                <ul style="margin:0 0 18px 18px;padding:0;font-size:14px;line-height:22px;color:#374151;">
                  <li style="margin:0 0 6px 0;">Ключ предназначен только для вас. Не передавайте его третьим лицам.</li>
                  <li style="margin:0 0 6px 0;">Мы никогда не просим пароль от аккаунта и не просим «подтвердить ключ» на сторонних сайтах.</li>
                </ul>

                <p style="margin:0 0 18px 0;font-size:14px;line-height:22px;color:#374151;">
                  Если активация не проходит — просто ответьте на это письмо или напишите на
                  <a href="mailto:support@wotstat.info" style="color:#2563eb;text-decoration:underline;">support@wotstat.info</a>,
                  приложив номер заказа №${options.orderId}.
                </p>

                <p style="margin:0;font-size:16px;line-height:24px;color:#111827;">
                  С уважением,<br />Команда WOTSTAT
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;font-family:Arial,Helvetica,sans-serif;color:#6b7280;font-size:12px;line-height:18px;">
                <div style="margin:0 0 6px 0;">
                  Сайт: <a href="https://positions.wotstat.info" style="color:#2563eb;text-decoration:underline;">positions.wotstat.info</a>
                </div>
                <div style="margin:0;">
                  Если вы не совершали покупку, напишите на
                  <a href="mailto:support@wotstat.info" style="color:#2563eb;text-decoration:underline;">support@wotstat.info</a>.
                </div>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const textBody = `Ваши ключи:\n` + options.keys.map(k => `${k}`).join('\n');

  return {
    subject: subject,
    htmlBody: htmlBody,
    textBody: textBody
  }
}