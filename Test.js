class Test extends Element {
  created(items) {
    this.items = reactive(items)
  }
  attached() {
    //this.items is now a plain array?
  }
}
