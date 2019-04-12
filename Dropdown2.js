const { 

  all,
  not,
  reactive,

  Element,
  Div,
  Input, 
  LI, 
  Button,
  UL, 
  Span,

  Renderer, 
  Variable,
  VString,
  VArray,

} = alkali

class Dropdown extends Element.with({ 

  /*
  children: [ 
    Div.with('.dre-dd-container', {
      children: [
        Div.with('.dre-dd-search-container'),
        Div.with('.dre-dd-list-container')
      ]
    })
  ] 
  */

}) {

  created({ parent=document.body, open=true, corner='topright', items, closed=false, ItemConstructor, InputConstructor }) {

    /* ensure data is reactive */

    // API: do i allow a single item? Array.isArray
    this.items = items instanceof Variable ? items : reactive(items || [])
     console.log('items in created: ', this.items)

    /* state */
    this.open = reactive(open)
    this.parent = parent
    this.corner = corner
    this.searchFilter = new VString('')
    this.selectedByIndex = reactive({})

    /* pick constructors */
    // API: custom constructors must have at least the default children
    this.Item = ItemConstructor || Button.with('.dre-dd-list-item')
    this.Input = (InputConstructor || Div.with('.dre-dd-search-input', {
      onkeyup: (e) => {
        this.searchFilter.put(e.target.value)
      },
      children: [
        Input.with('.dre-dd-search-input'),
        Span.with('.fa.fa-caret-down.dre-dd-search-input-icon')
      ]
    }))

  }
  attached() {

    this.append(new (Div.with('.dre-dd-container', {
      children: [
        Div.with('.dre-dd-search-container'),
        Div.with('.dre-dd-list-container', {
          classes: {
            hidden: not(this.open)
          }
        })
      ]
    })))

    const [dropdownContainer] = [...this.children]
    const [searchContainer, listContainer] = [...dropdownContainer.children]
    this.dropdownContainer = dropdownContainer
    this.searchContainer = searchContainer
    this.listContainer = listContainer
    this.searchInput = new this.Input({
      onkeyup: (e) => {
        this.searchFilter.put(e.target.value)
      }  
    })

    this.searchContainer.append(this.searchInput)

    // clean this up
    this.listContainer.append(
      new Div('.dre-dd-list', [
        this.items.map((itemText, index) => new this.Item('.dre-dd-list-item', {
          textContent: itemText,
          id: `dre-dd-item-${index}`,
          classes: {
            hidden: this.searchFilter.to(searchFilter => {
              if (searchFilter.length == 0)
                return false
              return !Boolean(itemText.toLowerCase().includes(searchFilter.toLowerCase()))
            }),
            selected: this.selectedByIndex.to(selections => selections[index])
          }
        }))

      ])
    )

    this.listContainer.addEventListener('click', this.onSelect.bind(this))
    this.position(this.parent)

    this.handleOutsideClicks = (e) => {
      const dropdown = this
      const dropdownWasClicked = e.composedPath().includes(dropdown) // find a composed path polyfill, doesnt work in edge/ie
      if (!dropdownWasClicked) {
      }
    }
    parent.addEventListener('click', this.handleOutsideClicks)

  }
  detached() {
    parent.removeEventListener('click', this.handleOutsideClicks)
  }
  onSelect({ target }) {

    let [ul] = [...this.listContainer.children]
    let listItems = [...ul.children]
    let index = listItems.indexOf(target)

    if (index < 0) 
      return

    const currentValue = this.selectedByIndex.get(index)

    if (currentValue == null)
      this.selectedByIndex.set(index, this.items[index])
    else
      this.selectedByIndex.undefine(index)

    console.log(currentValue, this.selectedByIndex.valueOf())


  }

  position(node, options = { corner: this.corner }) {
    // return early if there is no parent, to handle case of 'just a dropdown'

    const rect = node.getBoundingClientRect()
    const me = this.getBoundingClientRect()

    switch (options.corner) {

      case 'bottomleft':
        this.style.left = `${rect.left}px` 
        this.style.top = `${rect.bottom}px`
        return
      
      case 'bottomright':
        this.style.left = `${rect.right - this.offsetWidth}px` 
        this.style.top = `${rect.bottom}px`
        return
      
      case 'topleft':
        this.style.left = `${rect.left}px` 
        this.style.top = `${rect.top}px`
        return
      
      case 'topright':
        this.style.left = `${rect.right - this.offsetWidth}px` 
        this.style.top = `${rect.top}px`
        return
    }

  }

  toggle() {
  }

  show() {
  }

  hide() {
  }

}


