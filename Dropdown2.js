const { 

  all,
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

  children: [ 
    Div.with('.dre-dd-container', {
      children: [
        Div.with('.dre-dd-search-container'),
        Div.with('.dre-dd-list-container')
      ]
    })
  ] 

}) {

  created({ parent=document.body, corner='topright', items, hidden, ItemConstructor, InputConstructor }) {

    /* ensure data is reactive */

    // API: do i allow a single item? Array.isArray
    this.items = items instanceof Variable ? items : reactive(items || [])

    /* state */
    this.parent = parent
    this.corner = corner
    this.hidden = hidden || false
    this.searchFilter = new VString('')
    // think there, if new items are added, the active selection reprocesses array
    // array of booleans, indices are list items
    this.selectedByIndex = this.items.to(items => reactive(items.map(_ => false)) )

    /* pick constructors */
    this.Item = (ItemConstructor || LI).with('.dre-dd-list-item', {
      onkeyup: (e) => {
        this.searchFilter.put(e.target.value)
      }
    })
    this.Input = (InputConstructor || Div).with('.dre-dd-search-input', {
      children: [
        Input.with('.dre-dd-search-input'),
        Span.with('.fa.fa-caret-down.dre-dd-search-input-icon')
      ]
    })

  }
  attached() {

    const [dropdownContainer] = [...this.children]
    const [searchContainer, listContainer] = [...dropdownContainer.children]
    this.dropdownContainer = dropdownContainer
    this.searchContainer = searchContainer
    this.listContainer = listContainer

    this.searchContainer.append(new this.Input({
      onkeyup: (e) => {
        this.searchFilter.put(e.target.value)
      }  
    }))

    // clean this up
    this.listContainer.append(
      new UL('.dre-dd-list', [
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
  }
  onSelect({ target }) {

    let [ul] = [...this.listContainer.children]
    let listItems = [...ul.children]
    let index = listItems.indexOf(target)

    if (index < 0) 
      return

    this.selectedByIndex.set(index, !this.selectedByIndex.get(index))

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


