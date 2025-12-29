import { render as reactRender, toPlainText } from '@react-email/components';
import Confirmation from '../../../emails/Confirmation';

export type EmailData = {
  subject: string
  htmlBody: string
  textBody: string
}

type Options = {
  orderId: string
  name: string
  datetime: Date
  quantity: number
  totalAmount: number
  paymentMethod: string
  keys: string[]
  receipt?: { id: string, url: string }
}

export async function render(options: Options): Promise<EmailData> {

  const subject = `Ваш лицензионный ключ – заказ №${options.orderId}`;
  const htmlBody = await reactRender(<Confirmation
    keys={options.keys}
    order={{
      id: options.orderId,
      name: options.name,
      datetime: options.datetime,
      quantity: options.quantity,
      totalAmount: options.totalAmount,
      paymentMethod: options.paymentMethod,
    }}
    receipt={options.receipt || null}
  />);
  const textBody = toPlainText(htmlBody)

  return {
    subject: subject,
    htmlBody: htmlBody,
    textBody: textBody
  }
}