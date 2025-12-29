import { Html, Head, Body, Container, Section, Text, Heading, Link, Row, Column, Hr } from '@react-email/components';
import * as React from 'react';


export type ConfirmationOptions = {
  keys: string[]
  order: {
    id: string
    name: string
    datetime: Date
    quantity: number
    totalAmount: number
    paymentMethod: string
  }
  receipt: { id: string, url: string } | null
}

function Card({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) {
  return (
    <Section style={{
      padding: '20px',
      border: '1px solid #eaeaea',
      borderRadius: '12px',
      marginBottom: '15px',
      backgroundColor: '#fff',
      ...style,
    }}>
      {children}
    </Section>
  )
}

function TutorialLine({ number, title, description }: { number: number, title: string, description: React.ReactNode }) {
  return (
    <Section key={number} style={{ marginBottom: '10px' }}>
      <Row
        style={{
          paddingLeft: '12px',
          paddingRight: '32px',
        }}
      >
        <Column
          width="24"
          height="24"
          valign="top"
          align="center"
          style={{
            width: '24px',
            height: '24px',
            paddingRight: '18px',
          }}
        >
          <Row>
            <Column
              width="24"
              height="24"
              align="center"
              valign="middle"
              style={{
                width: '24px',
                height: '24px',
                backgroundColor: '#1390ff',
                borderRadius: '9999px',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '600',
                lineHeight: '1',
              }}
            >
              {number}
            </Column>
          </Row>
        </Column>
        <Column>
          <Heading
            as="h3"
            style={{
              fontSize: '18px',
              lineHeight: '25px',
              marginBottom: '5px',
              marginTop: '0px',
            }}
          >
            {title}
          </Heading>
          <Text
            style={{
              color: '#4d5567',
              fontSize: '14px',
              lineHeight: '1.6',
              margin: '0px',
            }}
          >
            {description}
          </Text>
        </Column>
      </Row>
    </Section>
  )
}

function HowToActivate() {
  return (
    <Card>
      <Heading as='h2' style={{ margin: 0, marginBottom: '16px', fontSize: '20px' }}>Как активировать</Heading>
      {
        [
          {
            title: 'Установите мод', description: <>
              Перейдите на страницу <Link href="https://ru.wotstat.info/install?preset=positions">wotstat.info/install</Link> установщика. Выберите папку с игрой и установите мод Позиции.
            </>
          },
          { title: 'Запустите игру', description: <></> },
          {
            title: 'Активируйте мод', description: <>
              В ангаре появится уведомление с предложением активировать мод. Нажмите кнопку «Активировать». В открывшемся окне вставьте ваш лицензионный ключ и подтвердите активацию.
            </>
          },
          { title: 'Готово', description: <>После успешной активации мод готов к использованию. Приятной игры!</> },
        ].map((feature, index) => TutorialLine({
          number: index + 1,
          title: feature.title,
          description: feature.description,
        }))
      }
      <Text style={{ marginBottom: 0 }}>
        Если активировать не получается или у вас возникли любые вопросы — просто ответьте на это письмо или напишите на <a href="mailto:support@wotstat.info" style={{ color: '#2563eb', textDecoration: 'underline' }}>support@wotstat.info</a>
      </Text>
    </Card>
  )
}

export default function Confirmation(props: ConfirmationOptions) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#f6f7f9', margin: 0, padding: '16px', fontFamily: 'Arial, Helvetica, sans-serif', color: '#151c26' }}>
        <Container>
          <Card style={{
            fontWeight: 'bold', marginBottom: '15px', padding: '10px 20px', backgroundColor: '#1290ff', color: '#ffffff',
            border: '1px solid #1290ff'
          }}>
            <Heading style={{ margin: 0, fontSize: '20px', lineHeight: '1' }}>Позиции от WotStat</Heading>
          </Card>


          <Card>
            <Heading as='h2' style={{ margin: 0, marginBottom: '10px', fontSize: '20px' }}>{props.keys.length == 1 ? "Ваш лицензионный ключ" : "Ваши лицензионные ключи"}</Heading>

            <Section style={{ border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#f9fafb', padding: '10px' }}>
              {props.keys.map((key, index) => (
                <Text key={index} style={{ margin: 0, fontFamily: 'Consolas,Menlo,Monaco,monospace', lineHeight: '1.5' }}>{key}</Text>
              ))}
            </Section>

            {
              props.keys.length > 1 ? (
                <>
                  <Text style={{ fontSize: '14px', marginBottom: 0 }}>
                    Ключи не складываются друг с другом<br />
                    <span style={{ color: '#6b7280' }}>
                      Дождитесь окончания лицензии первого ключа, чтобы активировать следующий. Срок действия лицензии начинается после первого боя.
                    </span>
                  </Text>
                </>
              ) : null
            }
          </Card>

          <HowToActivate />

          <Card>
            <Heading as='h2' style={{ margin: 0, marginBottom: '10px', fontSize: '20px' }}>Детали заказа</Heading>
            <ul style={{ paddingLeft: '16px', margin: 0 }}>
              {[
                { title: 'Название', value: <>{props.order.name}</> },
                { title: 'Номер заказа', value: <>№{props.order.id}</> },
                {
                  title: 'Дата', value: <>
                    {props.order.datetime.toLocaleDateString('ru-RU')} {props.order.datetime.toLocaleTimeString('ru-RU', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </>
                },
                { title: 'Сумма', value: <>{props.order.totalAmount} RUB</> },
                { title: 'Способ оплаты', value: <>{props.order.paymentMethod}</> },
              ].map((detail, index) => (
                <li key={index} style={{
                  fontSize: '14px',
                  lineHeight: '1.4',
                  color: '#374151',
                  marginBottom: '6px',
                }}>{detail.title}: <span style={{ color: '#151c26' }}>{detail.value}</span></li>
              ))
              }
            </ul>

            {
              props.receipt ? (
                <>
                  <Text style={{ fontSize: '14px', lineHeight: '1.6', color: '#374151', marginTop: '10px', marginBottom: '0' }}>
                    Чек №<span>{props.receipt.id}</span> доступен по ссылке: <Link href={props.receipt.url} style={{ color: '#2563eb', textDecoration: 'underline' }}>{props.receipt.url}</Link>
                  </Text>
                </>
              ) : null
            }
          </Card>


          <Card>
            <Heading as='h2' style={{ margin: 0, marginBottom: '10px', fontSize: '20px' }}>Важно</Heading>

            <Text style={{ marginBottom: 0 }}>Ключ предназначен только для вас. Не передавайте его третьим лицам.</Text>
          </Card>

          <Hr
            style={{
              marginTop: 16,
              borderTop: 'none',
              backgroundColor: '#d8d8d8',
              height: '1px',
              borderRadius: '1px',
              width: '100%',
            }}
          />

          <Section style={{ color: '#888888', textAlign: 'center', marginTop: '10px' }}>
            <Text style={{ fontSize: '14px', margin: 5 }}>
              Если вы не совершали эту покупку, проигнорируйте это письмо.
            </Text>
            <Text style={{ fontSize: '14px', margin: 5 }}>
              Сайт: <Link href="https://ru.positions.wotstat.info" style={{ color: '#2563eb', textDecoration: 'underline' }}>positions.wotstat.info</Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

Confirmation.PreviewProps = {
  keys: ['XXXX-XXXX-XXXX-XXXX', 'YYYY-YYYY-YYYY-YYYY'],
  order: {
    id: '0NEQvQLs',
    name: 'Позиции - 1 месяц',
    datetime: new Date(),
    quantity: 1,
    totalAmount: 2,
    paymentMethod: 'yookassa',
  },
  receipt: {
    id: 'receipt_123456',
    url: 'https://lknpd.nalog.ru/api/v1/receipt/781445983413/28237gvyqr/print',
  },
} satisfies ConfirmationOptions;