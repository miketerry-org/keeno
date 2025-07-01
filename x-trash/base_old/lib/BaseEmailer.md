class BaseEmailer {
async initialize(config){}
createMessage() {}
}

class NodeEmailer extends BaseEmailer {
async initialize(config){
// implement code to use "node-mailer" to send email messages
}
}

const emailer = new NodeEmailer()
await initialize(config)

const message = emailer.createMessage()
message.from("support@miketerry.org", "Mike Terry")
message.to("miketerry1030@gmail.com", "Michael Terry")
message.bcc.add("someone1@domain.com", "Mr. someone")
message.cc.add("someone2@domain.com", "Gale Simmons")
message.subject = "test message"
message.textBody = "hello mike!"
message.htmlBody = <h1>Hello Mike!</h1>"
message.files.add("readme.md")
message.send()
