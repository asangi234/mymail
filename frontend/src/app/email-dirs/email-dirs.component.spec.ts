import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailDirsComponent } from './email-dirs.component';

describe('EmailDirsComponent', () => {
  let component: EmailDirsComponent;
  let fixture: ComponentFixture<EmailDirsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EmailDirsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailDirsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
