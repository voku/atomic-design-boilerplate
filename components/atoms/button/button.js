class Button {
  constructor(text, cssClassSelector) {
    this.text = text;
    this.cssClassSelector = cssClassSelector;
  }
  
  onClickHandling() {
    var buttons = document.getElementsByClassName(this.cssClassSelector);
    buttons.onClick = function() {
      alert(this.text);
    }
  }
}

$foobar = new Button('foobar', '.js-button');
$foobar.onClickHandling();