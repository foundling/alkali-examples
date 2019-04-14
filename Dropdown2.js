const { 

  all,
  not,
  reactive,

  Button,
  Div,
  Element,
  I,
  Input, 
  LI, 
  Span,
  UL, 

  Renderer, 
  Variable,
  VString,
  VArray,

} = alkali

class Dropdown extends Element { 

  created(props) { 

    const {

      items, 
      values = [], 
      parent = null, 
      open = true, 
      corner = 'topright', 
      closed = false,
      placeholder = '',
      maxSelections = null,
      ItemConstructor,
      InputConstructor 

    } = this.props = props


    props.state = {
      itemContainerOpen: reactive(true)
    }
    // Q: HOW TO ACCEPT A PROMISE?

    /* ensure data is reactive */
    props.items = items instanceof Variable ? items : reactive(items || [])

    /* ensure data is reactive and initialized */
    // join w/ selected values somehow.  Just call initializeSelected
    props.values = values instanceof Variable ? values : reactive(values || [])
    props.maxSelections = maxSelections || props.items.get('length') 

    // work out what happens when you reach max. 
    // proposal: 
    // if it's one, just change the selection.
    // if multiple, change last selection to this one.

    /* state */
    props.open = reactive(open)
    props.placeholder = reactive(placeholder)
    props.parent = parent
    props.corner = corner // verify type algebraically
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

    /* SELECTION LIST */
    const selectedList = props.items.to(items => items.map((item, index) => {
      return new Button('.dre-dd-list-item.selected', {
        classes: {
          selected: props.selectedByIndex.to(selectedMap => {
            console.log(selectedMap, index)
            return Boolean(selectedMap[index])
          })
        }
      }, [
        Span(item),
        I('.fa.fa-remove.remove-item')
      ])
    }))

    this.append(new (Div.with('.dre-dd-container', {
      children: [
        Div.with('.dre-dd-search-container'),
        Div.with('.dre-dd-selected-container', selectedList),
        Div.with('.dre-dd-list-container', {
          classes: {
            //hidden: not(props.state.itemContainerOpen),
          }
        })
      ]
    })))

    const [dropdownContainer] = [...this.children]
    const [searchContainer, selectionsContainer, listContainer] = [...dropdownContainer.children]
    this.dropdownContainer = dropdownContainer
    this.searchContainer = searchContainer
    this.selectionsContainer = selectionsContainer 
    this.listContainer = listContainer
    this.searchInput = new props.Input({
      onkeyup: (e) => {
        props.searchFilter.put(e.target.value)
      }  
    })

    this.searchContainer.append(this.searchInput)

    /* UNSELECTED LIST ITEMS */
    this.listContainer.append(
      ...props.items.map((itemText, index) => new props.Item({
        id: `dre-dd-item-${index}`,
        classes: {
          hidden: this.searchFilter.to(searchFilter => {
            if (searchFilter.length == 0)
              return false
            return !Boolean(itemText.toLowerCase().includes(searchFilter.toLowerCase()))
          }),
          selected: props.selectedByIndex.to(selections => selections[index])
        },
      }, [ Span(itemText) ]))
    )

    this.selectionsContainer.addEventListener('click', this.remove.bind(this))
    this.listContainer.addEventListener('click', this.onSelect.bind(this))

    if (props.parent)
      this.position(props.parent)

    this.handleOutsideClicks = (e) => {
      const dropdown = this
      const dropdownWasClicked = e.composedPath().includes(dropdown) // find a composed path polyfill, doesnt work in edge/ie
      // figure out various state variables
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
  select() {
  }
  remove({ target }) {
    const props = this.props
    const listItems = [...this.selectionsContainer.children]
    const index = listItems.indexOf(target)
    debugger

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

    const mountPoint = node.getBoundingClientRect()
    const me = this.getBoundingClientRect()

    switch (options.corner) {

      case 'bottomleft':
        this.style.top = `${mountPoint.bottom}px`
        this.style.left = `${mountPoint.left}px` 
        return
      
      case 'bottomright':
        this.style.top = `${mountPoint.bottom}px`
        this.style.left = `${mountPoint.right - this.offsetWidth}px` 
        return
      
      case 'topleft':
        this.style.top = `${mountPoint.bottom}px`
        this.style.left = `${mountPoint.left}px` 
        return
      
      case 'topright':
        this.style.top = `${mountPoint.top}px`
        this.style.left = `${mountPoint.right - this.offsetWidth}px` 
        return
    }

  }
  attached() {
  }

  toggle() {
  }

  show() {
  }

  hide() {
  }

}
