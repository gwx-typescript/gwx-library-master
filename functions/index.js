const functions = require('firebase-functions')
const nodemailer = require('nodemailer')
const gmailEmail = functions.config().gmail.email
const gmailPassword = functions.config().gmail.password
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword
  }
})

exports.sendMail = functions.region('asia-northeast1').https.onCall((data, context) => {
  let subject
  let text
  let title = data.title
  let userName = data.userName

  switch (data.requestStatus) {
    case '承認済':
      subject = '購入申請承認のお知らせ'
      text = '以下の書籍の購入申請が承認されました。\n書籍の購入、登録をお願いします。\n\n'
        + '書籍名：' + title
      break

    case '却下':
      subject = '購入申請却下のお知らせ'
      text = '以下の書籍の購入申請が却下されました。\n'
        + '書籍名：' + title
      break

    case '申請中':
      subject = '購入申請のお知らせ'
      text = '購入申請されました。\n書籍の承認または却下をお願いします。'
        + '申請者：' + userName + '\n'
        + '書籍名：' + title
      break
  }

  let email = {
    from: gmailEmail,
    to: data.destination,
    subject: subject,
    text: text
  }
  mailTransport.sendMail(email, (err, info) => {
    if (err) {
      return console.log(err)
    }
    return console.log('success')
  })
})
