import ora from 'ora'
import { ServerClient } from 'postmark'
import { log, validateToken } from '../../utils'

interface Types {
  serverToken: string
  from: string
  to: string
  subject: string
  html: string
  text: string
}

export const command = 'raw [options]'
export const desc = 'Send a raw email'
export const builder = {
  'server-token': {
    type: 'string',
    hidden: true,
  },
  from: {
    type: 'string',
    describe:
      'Email address you are sending from. Must be an address on a verified domain or confirmed Sender Signature.',
    alias: 'f',
    required: true,
  },
  to: {
    type: 'string',
    describe: 'Email address you are sending to',
    alias: 't',
    required: true,
  },
  subject: {
    type: 'string',
    describe: 'The subject line of the email',
    required: true,
  },
  html: {
    type: 'string',
    describe: 'The HTML version of the email',
  },
  text: {
    type: 'string',
    describe: 'The text version of the email',
  },
}
export const handler = (args: Types) => exec(args)

/**
 * Execute the command
 */
const exec = (args: Types) => {
  const { serverToken } = args

  return validateToken(serverToken).then(token => {
    send(token, args)
  })
}

/**
 * Send the email
 */
const send = (serverToken: string, args: Types) => {
  const { from, to, subject, html, text } = args
  const spinner = ora('Sending an email').start()
  const client = new ServerClient(serverToken)

  client
    .sendEmail({
      From: from,
      To: to,
      Subject: subject,
      HtmlBody: html || undefined,
      TextBody: text || undefined,
    })
    .then(response => {
      spinner.stop()
      log(JSON.stringify(response))
    })
    .catch(error => {
      spinner.stop()
      log(error, { error: true })
      process.exit(1)
    })
}
