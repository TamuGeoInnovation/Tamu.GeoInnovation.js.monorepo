interface Event {
  title: string;
  date: number;
  description: string;
  keywords: Array<string>;
  media?: Array<object>;
}

export const events: Array<Event> = [
  {
    title: 'Graduation Parking Maps',
    date: 1557144000000,
    description: `
<p>In collaboration with Texas A&M Transportation Institute (TTI), Transportation Services, Department of Geography, and the Office of Mapping and Space Information (MSI), Aggies in need of parking guidance during graduation can visit the <a href="https://aggiemap.tamu.edu/graduation/arrival" target="_blank">graduation parking app</a> to find the best arrival and departure routes and parking locations.</p>
  `,
    keywords: ['Release']
  },
  {
    title: 'University Departments and Centers Search and List Support',
    date: 1552291200000,
    description: `
<p>University departments and centers can now be searched for anywhere there is an search input field.</p>
<div class="changelong-event-body-media">
    <a href="./assets/images/changelog/department-list/search.png" target="_blank">
        <figure>
            <img src="./assets/images/changelog/department-list/search.png" alt="Search Dropdown Departments and Centers" title="Search Dropdown Departments and Centers">
            <figcaption>Search Dropdown Departments and Centers</figcaption>
        </figure>
    </a>
</div>
<p>Furthermore, clicking on a building will display the building information in a popup updated with a list of departments and centers operating within.</p>
<div class="changelong-event-body-media">
    <a href="./assets/images/changelog/department-list/popup.png" target="_blank">
        <figure>
            <img src="./assets/images/changelog/department-list/popup.png" alt="Building Popup Department and Centers List" title="Building Popup Department and Centers List">
            <figcaption>Building Popup Department and Centers List</figcaption>
        </figure>
    </a>
</div>
  `,
    keywords: ['Feature', 'Improvement']
  },
  {
    title: 'Aggiemap Revamp',
    date: 1550004100000,
    description: `
    <h2>Overview</h2>
<p>Over the last few months, Aggiemap has undergone a complete re-write that will allow many future improvements and features while enabling some immediate improvements. For the keen observers, there isn't a dramatic change in visual presentation, save for some more rounded-ness sprinkled here and there. With brand new ponies under the hood, you can expect a more streamlined and performant Aggiemap experience. On to the changes:</p>
<h2>
    Mobile/Desktop Improvements
</h2>
<p>Previously, the mobile interface was determined by the viewport (screen area) size and CSS styles to render a more compact and user-friendly layout. A drawback of such an implementation was a lack of standard mobile behaviors, such as draggable and swipeable elements, and poor application flow. This iteration brings specifically-built components for both platforms that allow for finer control in content, styles, and behavior. As such, mobile devices have gained a more fluid interface and linear application flow.</p>
<h2>Mapping</h2>
<h3>Feature Selection</h3>
<p>Selected features (picking a suggested result from a search input) auto-zoom has been adjusted to prevent issues where the map zoom would be too far away, e.g. <a href="https://aggiemap.tamu.edu/?bldg=0356" target="_blank">The HUB - Bike Maintenance Shack</a>.</p>
<p>The auto-zoom has also been calibrated for trip planner results. This was a particularly important issue on mobile platforms, where device aspect ratios (taller height vs width) are different than traditional personal computer displays, that caused mapped routes to be largely clipped requiring user input to zoom to fit the entire trip path.</p>
<div class="changelong-event-body-media">
    <a href="./assets/images/changelog/re-write/feature-zoom-before.gif" target="_blank">
        <figure>
            <img src="./assets/images/changelog/re-write/feature-zoom-before-thumb.gif" alt="Feature Zoom Before" title="Feature Zoom Before">
            <figcaption>Feature Zoom Before</figcaption>
        </figure>
    </a>
</div>
<div class="changelong-event-body-media">
    <a href="./assets/images/changelog/re-write/feature-zoom-after.gif" target="_blank">
        <figure>
            <img src="./assets/images/changelog/re-write/feature-zoom-after-thumb.gif" alt="Feature Zoom After" title="Feature Zoom After">
            <figcaption>Feature Zoom After</figcaption>
        </figure>
    </a>
</div>
<h2>User Interface (UI)</h2>
<h3>Mobile Sidebar</h3>
<p>Mobile devices gained a sidebar where layer and legend toggles, and other reference links can be found. The sidebar can be accessed by tapping on the (<i class='material-icons'>menu</i>) icon on the search bar.</p>
<div class="changelong-event-body-media">
  <a href="./assets/images/changelog/re-write/mobile-sidebar.gif" target="_blank">
      <figure>
          <img src="./assets/images/changelog/re-write/mobile-sidebar-thumb.gif" alt="Mobile Sidebar" title="Mobile Sidebar">
          <figcaption>Mobile Sidebar</figcaption>
      </figure>
  </a>
</div>
<h3>Layer List</h3>
<p>The layer list should make it more obvious which layers are active and which are not. The previous symbology was fairly ambiguous combined with the enabled/disabled color states which yielded poor contrast.</p>
<div class="changelong-event-body-media">
  <a href="./assets/images/changelog/re-write/layer-list-before.gif" target="_blank">
      <figure>
          <img src="./assets/images/changelog/re-write/layer-list-before.gif" alt="Layer List Before" title="Layer List Before">
          <figcaption>Layer List Before</figcaption>
      </figure>
  </a>
  <a href="./assets/images/changelog/re-write/layer-list-after.gif" target="_blank">
    <figure>
        <img src="./assets/images/changelog/re-write/layer-list-after.gif" alt="Layer List After" title="Layer List After">
        <figcaption>Layer List After</figcaption>
    </figure>
</a>
</div>
<h3>Legend</h3>
<p>The legend now dynamically updates symbology based on the active layers.</p>
<div class="changelong-event-body-media">
  <a href="./assets/images/changelog/re-write/legend-after.gif" target="_blank">
      <figure>
          <img src="./assets/images/changelog/re-write/legend-after.gif" alt="Legend After" title="Legend After">
          <figcaption>Legend After</figcaption>
      </figure>
  </a>
</div>
<h2 id="220fb362-2fcb-11e9-b210-d663bd873d93">Trip Planner (formally referred to as routing/directions)</h2>
<h3>Network Optimizations</h3>
<p>Various trip planning network improvements have been made, resulting in an approximate 95% success rate for all trip calculations requested!</p>
<h3>Trip Result Actions</h3>
<p>Two new new options have been added in the trip result component: Share and Feedback.</p>
<div class="changelong-event-body-media">
  <a href="./assets/images/changelog/re-write/trip-result-actions.png" target="_blank">
      <figure>
          <img src="./assets/images/changelog/re-write/trip-result-actions.png" alt="Trip Result Actions" title="Trip Result Actions">
          <figcaption>Trip Result Actions</figcaption>
      </figure>
  </a>
</div>
<p><strong>Share</strong> copies a generated permanent link to your clipboard which can be distributed and shared. Loading the copied URL will re-calculate the trip with the exact same trip endpoints (start and end) as well as the selected mode travel mode. More on this feature below.</p>
<p><strong>Feedback</strong> replaces the "Report bad route" link at the bottom of the step-by-step directions. Please use this feature to report any issues or provide feedback on the trip planning results. The Aggiemap team is actively working on fixing and improving the trip planner network to provide sensible directions, paths, and increased success rates.</p>
<h3>URL Trip Loading</h3>
<p>Trip presets can be loaded into Aggiemap by constructed or pre-generated URL links. Example use cases include the following:</p>
<ul>
    <li>Registrar Howdy links to show routes between a building to the next without requiring input from the user.</li>
    <li>Departments can create a custom link for visitors which pre-populates the destination.</li>
    <li>Staff/faculty/students/visitors sharing directions.</li>
    <li>Individual campus tours.</li>
</ul>
<p>The URL parameters <code>stops</code>, <code>whereeveriam</code>, and <code>mode</code> has been reserved.</p>
<p>The <code>stops</code> parameter consists of a <code>@</code> delimited list of supported stop types.</p>
<p>The <code>whereeveriam</code> keyword represents a user's dynamic geolocation as a trip endpoint. This is useful for trips where one endpoint is known but the location from which any individual is loading the trip from, is not.
<p>The optional <code>mode</code> parameter can also be appended to the constructed URL preset.</p>
<h3>Supported Stop Types</h3>
<p>The <code>stops</code> parameter accepts any combination of supported stop types. These include:</p>
<ul>
    <li>Building number (preferred)
        <ul>
            <li>Example: <a href="https://aggiemap.tamu.edu/map/d/trip?stops=@1800@0443"><code>https://aggiemap.tamu.edu/map/d/trip?stops=@1800@0443</code></a></li>
        </ul>
    </li>
    <li>Building abbreviation
        <ul>
            <li>Example: <a href="https://aggiemap.tamu.edu/map/d/trip?stops=@msc@omb"><code>https://aggiemap.tamu.edu/map/d/trip?stops=@msc@omb</code></a></li>
        </ul>
    </li>
    <li>Any search-able attribute such as building name (not preferred since the top result may not be intended feature)
        <ul>
            <li>Example: <a href="https://aggiemap.tamu.edu/map/d/trip?stops=@evans library@eller oceanography"><code>https://aggiemap.tamu.edu/map/d/trip?stops=@evans library@eller oceanography</code></a></li>
        </ul>
    </li>
    <li>Raw lat/lon coordinates
        <ul>
            <li>Example: <a href="https://aggiemap.tamu.edu/map/d/trip?stops=@30.61438,-96.34336@30.61763, -96.33667"><code>https://aggiemap.tamu.edu/map/d/trip?stops=@30.61438,-96.34336@30.61763, -96.33667</code></a></li>
        </ul>
    </li>
    <li>Reserved user geolocation keyword
        <ul>
            <li>Example: <a href="https://aggiemap.tamu.edu/map/d/trip?stops=@whereeveriam@msc"><code>https://aggiemap.tamu.edu/map/d/trip?stops=@whereeveriam@msc</code></a></li>
        </ul>
    </li>
</ul>
<p>The Trip Planner will handle <em>n</em> stops, however the UI only allows a maximum of two. This limit can be exceeded by constructing a trip preset.</p>
<ul>
    <li>Example: <a href="https://aggiemap.tamu.edu/map/d/trip?stops=@whereeveriam@hlbl@klct@omb@whereeveriam"><code>https://aggiemap.tamu.edu/map/d/trip?stops=@whereeveriam@hlbl@klct@omb@whereeveriam</code></a></li>
</ul>
<p>The above example creates a trip from <strong>YOUR</strong> current location, to Hullabaloo Residence Hall, to Kleberg Center, to Eller Oceanography & Meteorology BUilding, and finally back to <strong>YOUR</strong> current location.</p>
<h3>Supported Travel Modes</h3>
<p>The optional travel modes are available:</p>
<ul>
    <li>1: Walk</li>
    <li>2: Walk Accessible</li>
    <li>3: Drive</li>
    <li>4: Drive Accessible</li>
    <li>5: Bus</li>
    <li>6: Bus Accessible</li>
    <li>7: Bike</li>
    <li>8: Drive</li>
    <li>9: Drive Accessible</li>
</ul>
    `,
    keywords: ['Release']
  },
  {
    title: 'Routing (Wayfinding) Bug Fixes',
    date: 1540443600000,
    description:
      'Lots of code bugs were harmed in the development of this update. Various bugs due to unexpected UI behaviour that resulted in inconsistent or incalculable routes have been fixed. This translates into nearly ~85% routing request success rate as opposed to the old 70%.',
    keywords: ['General', 'Bugs']
  },
  {
    title: 'Daily Routing (Wayfinding) Network Creation',
    date: 1540357200000,
    description:
      'We have automated the process of generating a new routing network every day to ensure the most up-to-date and precise directions, all the while being blazing fast! Whooosh!',
    keywords: ['Routing', 'Performance']
  },
  {
    title: 'Bus Routing (Wayfinding) Now Supported',
    date: 1540270800000,
    description:
      'Live off-campus and need to get to West Campus? Aggiemap now supports multi-modal routing that includes the most common bus routes, so you can get step-by-step directions on which buses you need to get on to get to your final destination!',
    keywords: ['Routing', 'Release']
  },
  {
    title: 'Major Routing Calculation Improvement',
    date: 1540184400000,
    description:
      'Integrated construction barriers into the routing network instead of providing an additional call to every request. The result is a substantial improvement in routing request response times from ~3 seconds to under 250 milliseconds!',
    keywords: ['Routing', 'Performance']
  },
  {
    title: 'Base ArcGIS JS API Update: 4.7 -> 4.9',
    date: 1539925200000,
    description:
      'ESRI works around the clock improving their JavaScript API. Of notable mention is the client-side rendering performance increase. Details @ https://developers.arcgis.com/javascript/latest/guide/release-notes/#api-updates-and-enhancements',
    keywords: ['General', 'Performance']
  },
  {
    title: 'Routing Network Update',
    date: 1536706272778,
    description:
      "The team is constantly working on improving the routing network to decrease the number of failed routes or routes that don't make sense. This update reduces up to 82% of the observed route failures (cases where the application cannot compute a reasonable route between two points) both for walking, with and without ADA option, and biking.",
    keywords: ['Routing', 'ADA']
  },
  {
    title: 'TAMU Move-In Parking Tool',
    date: 1534309200000,
    description:
      'In collaboration with Transportation Services, Department of Geography, and the Office of Mapping and Space Information, Aggies preparing to move-in to their on-campus residence hall can now find the latest and most accurate parking information for their hall and move-in day. This tool will help Aggies streamline their move-in day and avoid frustrations such as parking citations or being towed.',
    keywords: ['Release'],
    media: [
      {
        url: './assets/images/changelog/move-in/new.png',
        title: 'Move-In Parking Map'
      }
    ]
  },
  {
    title: 'Added Building Proctor Button to Popup',
    date: 1531976400000,
    description:
      "Need to report building emergencies or maintenance issues? Contact a building proctor. Every building popup now carries a 'Building Proctor' button that redirects to a list, if available, of proctors for that building maintained by the Office of Mapping and Space Information (MSI).",
    keywords: ['UI'],
    media: [
      {
        url: './assets/images/changelog/proctor-button/old.png',
        title: 'Building Popup Before Update'
      },
      {
        url: './assets/images/changelog/proctor-button/new.png',
        title: 'Building Popup After Update'
      }
    ]
  },
  {
    title: 'Routing (Wayfinding) Support Added',
    date: 1528434000000,
    description:
      'The days of getting lost on-campus are a thing of the past! Aggiemap now supports point-to-point routing with a map display of the suggested route and step-by-step directions on how to get there. All this has, of course, been optimized for mobile devices for on-the-go students. Furthermore, following university policy, Aggiemap is committed to ensuring all features and information is accessible to all individuals. Because of this, our routing network allows users requiring accessible accommodations, to generate routes that lead through ramps, curb cuts, powered entrances, etc. The following routing modes are supported: Walking, Walking ADA, and Biking, with more to come soon!',
    keywords: ['Feature', 'Release'],
    media: [
      {
        url: './assets/images/changelog/routing/desktop.png',
        title: 'Desktop Routing'
      },
      {
        url: './assets/images/changelog/routing/mobile.png',
        title: 'Mobile Routing'
      }
    ]
  },
  {
    title: 'Mobile Friendly UI',
    date: 1528088400000,
    description:
      'Aggiemap is now mobile friendly, huzzah! UI has been re-engineered to work on all modern mobile phones using an intuitive and streamlined interface.',
    keywords: ['UI'],
    media: [
      {
        url: './assets/images/changelog/mobile/old.png',
        title: 'Old mobile aggiemap view.'
      },
      {
        url: './assets/images/changelog/mobile/new.gif',
        title: 'New mobile aggiemap view.'
      }
    ]
  }
];
