import * as React from 'react'
import { Html, Body, Container, Text, Section, Row, Column, Link, Hr } from '@react-email/components'

interface OrderItem {
  name: string
  size: string
  qty: number
  line_total: number
}

interface Props {
  orderNumber: string
  items: OrderItem[]
  total: number
  address: {
    line1: string
    line2?: string
    city: string
    province: string
    country: string
    postal_code: string
  }
}

export function OrderConfirmationEmail({ orderNumber, items, total, address }: Props) {
  return (
    <Html>
      <Body style={{ backgroundColor: '#FAF7F4', fontFamily: 'sans-serif', margin: 0 }}>
        <Container style={{ maxWidth: 560, margin: '0 auto', padding: '40px 24px' }}>

          <Text style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#6B3A22', margin: '0 0 8px' }}>
            Known & Worn
          </Text>
          <Text style={{ fontSize: 28, fontWeight: 300, color: '#3B1F0E', margin: '0 0 8px' }}>
            Order confirmed
          </Text>
          <Text style={{ fontSize: 14, color: '#6B3A22', margin: '0 0 32px' }}>
            Order #{orderNumber}
          </Text>

          <Text style={{ fontSize: 14, color: '#6B3A22', lineHeight: '1.6', margin: '0 0 32px' }}>
            Thanks for your order. We'll get it packed and on its way shortly.
          </Text>

          <Section style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #FFE8D6', padding: '20px 24px', marginBottom: 24 }}>
            <Text style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6B3A22', margin: '0 0 16px' }}>
              Items ordered
            </Text>
            {items.map((item, i) => (
              <Row key={i} style={{ marginBottom: 10 }}>
                <Column><Text style={{ fontSize: 14, color: '#3B1F0E', margin: 0 }}>{item.name} — {item.size} × {item.qty}</Text></Column>
                <Column style={{ textAlign: 'right' }}><Text style={{ fontSize: 14, color: '#3B1F0E', margin: 0 }}>₱{item.line_total.toLocaleString()}</Text></Column>
              </Row>
            ))}
            <Hr style={{ borderColor: '#FFE8D6', margin: '16px 0 12px' }} />
            <Row>
              <Column><Text style={{ fontSize: 14, fontWeight: 500, color: '#3B1F0E', margin: 0 }}>Total paid</Text></Column>
              <Column style={{ textAlign: 'right' }}><Text style={{ fontSize: 14, fontWeight: 500, color: '#3B1F0E', margin: 0 }}>₱{total.toLocaleString()}</Text></Column>
            </Row>
          </Section>

          <Section style={{ backgroundColor: '#fff', borderRadius: 12, border: '1px solid #FFE8D6', padding: '20px 24px', marginBottom: 32 }}>
            <Text style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#6B3A22', margin: '0 0 12px' }}>
              Shipping to
            </Text>
            <Text style={{ fontSize: 14, color: '#3B1F0E', lineHeight: '1.8', margin: 0 }}>
              {address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />
              {address.city}, {address.province}<br />
              {address.country} {address.postal_code}
            </Text>
          </Section>

          <Section style={{ textAlign: 'center', marginBottom: 40 }}>
            <Link
              href={`${process.env.NEXT_PUBLIC_SITE_URL}/account/orders`}
              style={{ backgroundColor: '#3B1F0E', color: '#FAF7F4', padding: '12px 32px', borderRadius: 99, fontSize: 14, textDecoration: 'none' }}
            >
              View your order
            </Link>
          </Section>

          <Text style={{ fontSize: 12, color: '#6B3A22', textAlign: 'center', lineHeight: '1.6' }}>
            Questions? Email us at{' '}
            <Link href="mailto:mark.payns@gmail.com" style={{ color: '#3B1F0E' }}>mark.payns@gmail.com</Link>
          </Text>

        </Container>
      </Body>
    </Html>
  )
}