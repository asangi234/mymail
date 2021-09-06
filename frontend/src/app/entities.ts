export class Contact{
    name:string=null;
    email:string=null;
}

export class Email{
    id:string;
    from:Contact =null;
    to:Contact[]=null;
    subject:string =null;
    body:string =null;
    date:Date=null;
    mailed_by:string=null;
    signed_by:string=null;
    security:string=null;
    attachments:string[]=null;
    reply_to:Contact=null;
    read:boolean;
    bcc:Contact=null;
    cc:Contact[]=null;
    showurl:boolean=false;

    public has_attachments():boolean{
        return (this.attachments)&&(this.attachments.length>0)
    }
}

export class User {
    id: number;
    username: string;
    session_id?: string;
}