const hideMe = reactive(false)
const block = new Button('.dd-button', { 
  onclick() {
    hideMe.put(!hideMe.valueOf())
  },
  textContent: 'dropdown', 
  style: {
    fontSize: '40px',
      padding: '50px',
      border: '1px solid black',
      marginLeft: '300px',
  }
})
/*
const items = new VArray(fetch('https://jsonplaceholder.typicode.com/todos')
    .then(response => response.json())
    .then(data => data.map(item => item.title)))
*/

const reasonsRejected = reactive([])
const D = Dropdown.defineElement('dre-dd')

document.body.appendChild(block)


const dd = new D('#demo', {
    classes: {
      hidden: hideMe,
    }
  }, {
  placeholder: 'rejection reasons',
  parent: document.querySelector('.dd-button'),
  corner: 'topleft',
  items: data.slice(0,5),
  //values: ['Aaron'],
  //items: data,
  //Item: MyListItem
})

document.body.appendChild(dd)

document.body.appendChild(
  new Div({
      style: { 
        'margin-top': '200px',
      }
    }, [ 
      new Span('SEARCH STRING: '), 
      new Span(dd.searchFilter) 
    ]
  )
)

document.body.appendChild(
  new Div({
    style: { 
    }
  }, [ 
    new Span('SELECTIONS: '), 
    new Span(dd.selectedValues.to(values => values.join(' | ')))
  ])
)
document.body.appendChild(
  new Div({
    style: { 
    }
  }, [ new Span('SELECTION DATA: '), 
       new Span(dd.selectedByIndex.to(obj => Object.keys(obj).map(k => obj[k]).join(' | '))) ]
  )
)

//document.body.append(new Test({items:['alex','ramsdell'] }))
