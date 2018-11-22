const { Div, H1, Input, Pre, reactive, Variable  } = alkali

const Val = new Variable({
  firstName: 'alex',
  lastName: 'ramsdell',
  age: 33
})

const updateProp = propName => e => Val.set(propName, e.target.value)

const Container = Div('#container', [ 
    Pre({
      textContent: Val.to(v => JSON.stringify(v, null, 2))
    }),
    H1({
      textContent: Val.to(v => `${Val.property('firstName')}
                    ${Val.property('lastName')}, 
                    ${Val.property('age')}`)
    }),
    Input('.first-name', {
      onkeyup: updateProp('firstName'),
      value: Val.get('firstName'),
      placeholder: 'first name',
    }),
    Input('.last-name', {
      onkeyup: updateProp('lastName'),
      value: Val.get('lastName'),
      placeholder: 'last name',
    }),
    Input('.age', {
      onkeyup: updateProp,
      value: Val.get('age'),
      placeholder: 'age',
    })
])
document.body.appendChild(new Container())
