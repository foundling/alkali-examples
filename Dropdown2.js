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


class Dropdown extends Element { 

  created(props) { 
    const {
      items, 
      values, 
      parent=document.body, 
      open=true, 
      corner='topright', 
      closed=false,
      placeholder='',
      maxSelections=null,
      ItemConstructor,
      InputConstructor 
    } = props


    this.props = props
    // API: do i allow a single item? Array.isArray
    // HOW TO ACCEPT A PROMISE?

    /* ensure data is reactive */
    props.items = items instanceof Variable ? items : reactive(items || [])
    props.values = values instanceof Variable ? values : reactive(values || [])
    props.maxSelections = maxSelections || props.items.get('length') 

    // work out what happens when you reach max. 
    // proposal: 
    // if it's one, just change the selection.
    // if multiple, need to deselect before selecting a new item 

    /* state */
    props.open = reactive(open)
    props.placeholder = reactive(placeholder)
    props.parent = parent
    props.corner = corner
    props.searchFilter = new VString('')
    props.selectedByIndex = reactive(this.initializeSelected(props.values.valueOf(), props.items.valueOf())) // map from index to value
    props.selectedValues = props.selectedByIndex.to(obj => { // array of just values
      return Object.keys(obj).reduce((arr, key) => {
        return obj[key] ? arr.concat(obj[key]) : arr
      }, [])
    })

    /* pick constructors */
    // API: custom constructors must have at least the default children
    props.Item = ItemConstructor || Button.with('.dre-dd-list-item')
    props.Input = (InputConstructor || Div.with('.dre-dd-search-input', {
      onkeyup: (e) => {
        props.searchFilter.put(e.target.value)
      },
      children: [
        Input.with('.dre-dd-search-input-el', {
          placeholder: props.placeholder
        }),
        Span.with('.fa.fa-search.dre-dd-search-input-icon')
      ]
    }))

  }
  ready(props) {

    const selectedList = props.items.to(items => items.map((item, index) => {
      return new Button('.dre-dd-selection', {
        hidden: props.selectedByIndex.to(selectedMap => selectedMap[index])
      })
    }))
    this.append(new (Div.with('.dre-dd-container', {
      children: [
        Div.with('.dre-dd-selections-container', [
            ...props.selectedValues.to(selected => selected.map(value => new props.Item('.selected-item', [value])))
        ]),
        Div.with('.dre-dd-search-container'),
        Div.with('.dre-dd-list-container', {
          classes: {
            hidden: not(props.open)
          }
        })
      ]
    })))

    const [dropdownContainer] = [...this.children]
    const [selectionsContainer, searchContainer, listContainer] = [...dropdownContainer.children]
    this.dropdownContainer = dropdownContainer
    this.searchContainer = searchContainer
    this.listContainer = listContainer
    this.searchInput = new props.Input({
      onkeyup: (e) => {
        props.searchFilter.put(e.target.value)
      }  
    })

    this.searchContainer.append(this.searchInput)

    // clean this up
    this.listContainer.append(
      new Div('.dre-dd-list', [
        props.items.map((itemText, index) => new props.Item({
          textContent: itemText,
          id: `dre-dd-item-${index}`,
          classes: {
            hidden: this.searchFilter.to(searchFilter => {
              if (searchFilter.length == 0)
                return false
              return !Boolean(itemText.toLowerCase().includes(searchFilter.toLowerCase()))
            }),
            selected: props.selectedByIndex.to(selections => selections[index])
          }
        }))

      ])
    )

    this.listContainer.addEventListener('click', this.onSelect.bind(this))
    this.position(props.parent)

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
  initializeSelected(values, list) {
    const memo = {}
    for (let [i,v] of list.entries()) {
      if (values.includes(v))
        memo[i] = v
    }
    return memo
  }
  onSelect({ target }) {

    const props = this.props
    const [ul] = [...this.listContainer.children]
    const listItems = [...ul.children]
    const index = listItems.indexOf(target)
    const selectedValueCount = Object.keys(props.selectedValues.valueOf()).length

    if (index < 0) 
      return

    /* problematic: which to deselect ? */
    const currentValue = props.selectedByIndex.get(index)
    if (currentValue == null) {
      props.selectedByIndex.set(index, props.items.get(index))
    }
    else
      props.selectedByIndex.undefine(index)

  }

  position(node, options = { corner: this.props.corner }) {
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
