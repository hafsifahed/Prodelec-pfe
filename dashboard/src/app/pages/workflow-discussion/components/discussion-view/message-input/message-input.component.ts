import { Component, EventEmitter, Output, Input } from '@angular/core';

@Component({
  selector: 'app-message-input',
  templateUrl: './message-input.component.html',
  styleUrls: ['./message-input.component.scss']
})
export class MessageInputComponent {
  @Output() messageSent = new EventEmitter<string>();
  @Output() typing = new EventEmitter<void>();
  @Input() disabled = false; // Add this line
  
  messageContent = '';
  private typingDebounce: any;

  sendMessage(): void {
    const trimmedContent = this.messageContent.trim();
    if (trimmedContent) {
      this.messageSent.emit(trimmedContent);
      this.messageContent = '';
    }
  }

  onInput(): void {
    // Clear existing debounce
    if (this.typingDebounce) clearTimeout(this.typingDebounce);
    
    // Emit typing event after 500ms of inactivity
    this.typing.emit();
    
    // Reset debounce
    this.typingDebounce = setTimeout(() => {
      // Do nothing, just prevent rapid firing
    }, 500);
  }
}