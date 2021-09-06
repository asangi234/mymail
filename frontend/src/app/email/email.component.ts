import { Component, ViewChild, ElementRef, Input } from '@angular/core';
import { Email, Contact } from "../entities";
import { EmailService } from "../email.service"
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'app-email',
    templateUrl: './email.component.html',
    styleUrls: ['./email.component.css']
})
export class EmailComponent{
    constructor(
        private element:ElementRef,
        private emailService: EmailService,
        private domSanitier: DomSanitizer,
    ) { }

    over_element=null;
    
    

    email: Email;
    loading = false;

    private emailBody: ElementRef;

    @ViewChild('emailBody') set content(content: ElementRef) {
        this.emailBody = content;
        if (this.emailBody == null) {
            return
        }
    }

    email_body() {
        return this.domSanitier.bypassSecurityTrustHtml(this.email.body)
    }

    download_link(){
        if (this.email.id.startsWith("lg")){
            return "assets/not_a_phish.pdf"
        }else{
            return "assets/phish.pdf"
        }
    }

    handle_click(event) {
        let parent = event.target
        while (parent !== this.emailBody.nativeElement) {
            if (parent.nodeName == "A") {
                event.preventDefault();
                event.stopImmediatePropagation();
                alert("Link activated")
                break
            }
            parent = parent.parentElement
        }
    }


    load_email(id: String) {
        this.loading = true
        this.emailService.getEmail(id)
            .subscribe(email => {
                this.email = email;
                this.loading = false;
                this.scrollToTop();

            });
    }

    scrollToTop(){
        this.element.nativeElement.scrollIntoView();
    }

    get showurl(){
        if (this.email){
            return this.email.showurl
        }

        return false
    }

}


@Component({
    selector: 'app-email-contact',
    templateUrl: './email_contact.component.html',
    styleUrls: ['./email.component.css']
})
export class EmailContactComponent {
    @Input() contact:Contact;
    @Input() nameOnly:boolean=false;
}

