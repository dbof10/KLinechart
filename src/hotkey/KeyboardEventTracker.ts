
class KeyboardEventTracker {
  private static instance: KeyboardEventTracker;
  private isShiftPressed: boolean = false;

  private constructor() {
    // Bind the event handlers
    document.onkeydown = this.handleKeyDown.bind(this);
    document.onkeyup = this.handleKeyUp.bind(this);
  }

  public static getInstance(): KeyboardEventTracker {
    if (!KeyboardEventTracker.instance) {
      KeyboardEventTracker.instance = new KeyboardEventTracker();
    }
    return KeyboardEventTracker.instance;
  }

  private handleKeyDown(event: KeyboardEvent): void {
    if (event.shiftKey) {
      this.isShiftPressed = true;
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    if (!event.shiftKey) {
      this.isShiftPressed = false;
    }
  }

  public checkShiftKeyState(): boolean {
    return this.isShiftPressed;
  }
}

export const keyboardTracker = KeyboardEventTracker.getInstance();
