import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';

import { TabsComponent } from './tabs.component';
import { TabComponent } from './tab/tab.component';
import { AbstractContentReplacerComponent } from '../../abstracts/abstract-content-swap/abstract-content-replacer.component';

@Component({
  template: `
    <tamu-gisc-tab></tamu-gisc-tab>
  `
})
class TestComponent {
  @ViewChild(TabComponent, { static: true })
  public title: TabComponent;
}

describe('TabsComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TabsComponent, TabComponent, AbstractContentReplacerComponent, TestComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
