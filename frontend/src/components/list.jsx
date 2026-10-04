import React from 'react'


function List({ title, items }) {

  return (

    <section className="report-panel">

      <h3>
        {title}
      </h3>

      <ul>

        {items.map((item, index) => (

          <li key={index}>
            {item}
          </li>

        ))}

      </ul>

    </section>

  )
}


export default Lists