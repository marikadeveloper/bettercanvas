const syncedSwitches = [
  'remind',
  'tab_icons',
  'hide_feedback',
  'dark_mode',
  'remlogo',
  'full_width',
  'auto_dark',
  'assignments_due',
  'gpa_calc',
  'gradient_cards',
  'disable_color_overlay',
  'dashboard_grades',
  'dashboard_notes',
  'better_todo',
  'condensed_cards',
];
const syncedSubOptions = [
  'todo_colors',
  'device_dark',
  'relative_dues',
  'card_overdues',
  'todo_overdues',
  'gpa_calc_prepend',
  'auto_dark',
  'auto_dark_start',
  'auto_dark_end',
  'num_assignments',
  'assignment_date_format',
  'todo_hr24',
  'grade_hover',
  'hide_completed',
  'num_todo_items',
  'hover_preview',
];
const localSwitches = [];

//const apiurl = "http://localhost:3000";
const apiurl = 'https://bettercanvas.diditupe.dev';

const defaultOptions = {
  local: {
    previous_colors: null,
    previous_theme: null,
    errors: [],
  },
  sync: {
    dark_preset: {
      'background-0': '#161616',
      'background-1': '#1e1e1e',
      'background-2': '#262626',
      borders: '#3c3c3c',
      'text-0': '#f5f5f5',
      'text-1': '#e2e2e2',
      'text-2': '#ababab',
      links: '#56Caf0',
      sidebar: '#1e1e1e',
      'sidebar-text': '#f5f5f5',
    },
    new_install: true,
    assignments_due: true,
    gpa_calc: false,
    dark_mode: true,
    gradent_cards: false,
    disable_color_overlay: false,
    auto_dark: false,
    auto_dark_start: { hour: '20', minute: '00' },
    auto_dark_end: { hour: '08', minute: '00' },
    num_assignments: 4,
    custom_domain: [''],
    assignments_done: [],
    dashboard_grades: false,
    assignment_date_format: false,
    dashboard_notes: false,
    dashboard_notes_text: '',
    better_todo: false,
    todo_hr24: false,
    condensed_cards: false,
    custom_cards: {},
    custom_cards_2: {},
    custom_cards_3: {},
    custom_assignments: [],
    custom_assignments_overflow: ['custom_assignments'],
    grade_hover: false,
    hide_completed: false,
    num_todo_items: 4,
    custom_font: { link: '', family: '' },
    hover_preview: true,
    full_width: null,
    remlogo: null,
    gpa_calc_bounds: {
      'A+': { cutoff: 97, gpa: 4.3 },
      A: { cutoff: 93, gpa: 4 },
      'A-': { cutoff: 90, gpa: 3.7 },
      'B+': { cutoff: 87, gpa: 3.3 },
      B: { cutoff: 83, gpa: 3 },
      'B-': { cutoff: 80, gpa: 2.7 },
      'C+': { cutoff: 77, gpa: 2.3 },
      C: { cutoff: 73, gpa: 2 },
      'C-': { cutoff: 70, gpa: 1.7 },
      'D+': { cutoff: 67, gpa: 1.3 },
      D: { cutoff: 63, gpa: 1 },
      'D-': { cutoff: 60, gpa: 0.7 },
      F: { cutoff: 0, gpa: 0 },
    },
    todo_overdues: false,
    card_overdues: false,
    relative_dues: false,
    hide_feedback: false,
    dark_mode_fix: [],
    assignment_states: {},
    tab_icons: false,
    todo_colors: false,
    device_dark: false,
    cumulative_gpa: {
      name: 'Cumulative GPA',
      hidden: false,
      weight: 'dnc',
      credits: 999,
      gr: 3.21,
    },
    show_updates: false,
    card_method_date: false,
    card_method_dashboard: false,
    card_limit: 25,
  },
};

sendFromPopup('getCards');

// refresh the cards if new ones were just recieved
chrome.storage.onChanged.addListener((changes) => {
  if (changes['custom_cards']) {
    if (
      Object.keys(changes['custom_cards'].oldValue).length !==
      Object.keys(changes['custom_cards'].newValue).length
    ) {
      displayAdvancedCards();
    }
  }
});

function displayErrors() {
  chrome.storage.local.get('errors', (storage) => {
    storage['errors'].forEach((e) => {
      document.querySelector('#error_log_output').value += e + '\n\n';
    });
  });
}

function displayDarkModeFixUrls() {
  let output = document.getElementById('dark-mode-fix-urls');
  output.textContent = '';
  chrome.storage.sync.get('dark_mode_fix', (sync) => {
    sync['dark_mode_fix'].forEach((url) => {
      //let div = makeElement("div", "customization-button", output, url);
      let div = makeElement('div', output, {
        className: 'customization-button',
        textContent: url,
      });
      div.classList.add('fixed-url');
      let btn = makeElement('button', div, {
        className: 'dd',
        textContent: 'x',
      });
      btn.addEventListener('click', () => {
        chrome.storage.sync.get('dark_mode_fix', (sync) => {
          for (let i = 0; i < sync['dark_mode_fix'].length; i++) {
            if (sync['dark_mode_fix'][i] === url) {
              sync['dark_mode_fix'].splice(i);
              chrome.storage.sync
                .set({ dark_mode_fix: sync['dark_mode_fix'] })
                .then(() => div.remove());
            }
          }
        });
      });
    });
  });
}

document.addEventListener('DOMContentLoaded', setup);

function setupAssignmentsSlider(initial) {
  let el = document.querySelector('#numAssignmentsSlider');
  el.value = initial;
  document.querySelector('#numAssignments').textContent = initial;
  el.addEventListener('input', function () {
    document.querySelector('#numAssignments').textContent = this.value;
    chrome.storage.sync.set({ num_assignments: this.value });
  });
}

function setupTodoSlider(initial) {
  let el = document.querySelector('#numTodoItemsSlider');
  el.value = initial;
  document.querySelector('#numTodoItems').textContent = initial;
  document
    .querySelector('#numTodoItemsSlider')
    .addEventListener('input', function () {
      document.querySelector('#numTodoItems').textContent = this.value;
      chrome.storage.sync.set({ num_todo_items: this.value });
    });
}

function setupAutoDarkInput(initial, time) {
  let el = document.querySelector('#' + time);
  el.value = initial.hour + ':' + initial.minute;
  el.addEventListener('change', function () {
    let timeinput = {
      hour: this.value.split(':')[0],
      minute: this.value.split(':')[1],
    };
    time === 'auto_dark_start'
      ? chrome.storage.sync.set({ auto_dark_start: timeinput })
      : chrome.storage.sync.set({ auto_dark_end: timeinput });
  });
}

function setupCardLimitSlider(initial) {
  let el = document.querySelector('#card_limit');
  el.value = initial;
  document.querySelector('#card_limit_num').textContent = initial;
  el.addEventListener('change', (e) => {
    chrome.storage.sync.set({
      custom_cards: {},
      custom_cards_2: {},
      custom_cards_3: {},
      card_limit: parseInt(e.target.value),
    });
  });
  el.addEventListener('input', (e) => {
    document.querySelector('#card_limit_num').textContent = e.target.value;
  });
}

function setupDashboardMethod(initial) {
  const el = document.getElementById('card_method_dashboard');
  el.checked = initial === true ? true : false;

  el.addEventListener('change', (e) => {
    chrome.storage.sync.set({
      custom_cards: {},
      custom_cards_2: {},
      custom_cards_3: {},
      card_method_dashboard: e.target.checked,
    });
  });
}

function setup() {
  const menu = {
    switches: syncedSwitches,
    checkboxes: [
      'browser_show_likes',
      'gpa_calc_weighted',
      'gpa_calc_cumulative',
      /*'card_method_date',*/ 'show_updates',
      'todo_colors',
      'device_dark',
      'relative_dues',
      'card_overdues',
      'todo_overdues',
      'gpa_calc_prepend',
      'auto_dark',
      'assignment_date_format',
      'todo_hr24',
      'grade_hover',
      'hide_completed',
      'hover_preview',
    ],
    tabs: {
      'advanced-settings': { setup: displayAdvancedCards, tab: '.advanced' },
      'gpa-bounds-btn': {
        setup: displayGPABounds,
        tab: '.gpa-bounds-container',
      },
      'custom-font-btn': {
        setup: displayCustomFont,
        tab: '.custom-font-container',
      },
      'card-colors-btn': { setup: null, tab: '.card-colors-container' },
      'customize-dark-btn': {
        setup: displayDarkModeFixUrls,
        tab: '.customize-dark',
      },
      'import-export-btn': { setup: displayThemeList, tab: '.import-export' },
      'report-issue-btn': {
        setup: displayErrors,
        tab: '.report-issue-container',
      },
      'updates-btn': { setup: null, tab: '.updates-container' },
    },
    special: [
      {
        identifier: 'auto_dark_start',
        setup: (initial) => setupAutoDarkInput(initial, 'auto_dark_start'),
      },
      {
        identifier: 'auto_dark_end',
        setup: (initial) => setupAutoDarkInput(initial, 'auto_dark_end'),
      },
      {
        identifier: 'num_assignments',
        setup: (initial) => setupAssignmentsSlider(initial),
      },
      {
        identifier: 'num_todo_items',
        setup: (initial) => setupTodoSlider(initial),
      },
      {
        identifier: 'card_limit',
        setup: (initial) => setupCardLimitSlider(initial),
      },
      {
        identifier: 'card_method_dashboard',
        setup: (initial) => setupDashboardMethod(initial),
      },
      {
        identifier: 'custom_styles',
        setup: (initial) => setupCustomStyle(initial),
      },
    ],
  };

  chrome.storage.sync.get(menu.switches, (sync) => {
    menu.switches.forEach((option) => {
      let optionSwitch = document.getElementById(option);
      let status = sync[option] === true ? '#on' : '#off';
      optionSwitch.querySelector(status).checked = true;
      optionSwitch.querySelector(status).classList.add('checked');

      optionSwitch.querySelector('.slider').addEventListener('mouseup', () => {
        let status = !optionSwitch.querySelector('#on').checked;
        optionSwitch.querySelector('#on').checked = status;
        optionSwitch.querySelector('#on').classList.toggle('checked');
        optionSwitch.querySelector('#off').classList.toggle('checked');
        chrome.storage.sync.set({ [option]: status });
        if (option === 'auto_dark') {
          toggleDarkModeDisable(status);
        }
      });
    });
  });

  chrome.storage.sync.get(menu.checkboxes, (sync) => {
    menu.checkboxes.forEach((option) => {
      document
        .querySelector('#' + option)
        .addEventListener('change', function (e) {
          let status = this.checked;
          chrome.storage.sync.set(JSON.parse(`{"${option}": ${status}}`));
        });
      document.querySelector('#' + option).checked = sync[option];
    });
    /*
        document.querySelector('#autodark_start').value = result.auto_dark_start["hour"] + ":" + result.auto_dark_start["minute"];
        document.querySelector('#autodark_end').value = result.auto_dark_end["hour"] + ":" + result.auto_dark_end["minute"];
        document.querySelector("#assignment_date_format").checked = result.assignment_date_format == true;
        document.querySelector("#todo_hr24").checked = result.todo_hr24 == true;
        */
    toggleDarkModeDisable(sync.auto_dark);
  });

  const specialOptions = menu.special.map((obj) => obj.identifier);
  chrome.storage.sync.get(specialOptions, (sync) => {
    console.log(sync);
    menu.special.forEach((option) => {
      if (option.setup !== null) option.setup(sync[option.identifier]);
    });
  });

  /*
    // checkboxes
    menu.checkboxes.forEach(checkbox => {
        document.querySelector("#" + checkbox).addEventListener('change', function () {
            let status = this.checked;
            chrome.storage.sync.set(JSON.parse(`{"${checkbox}": ${status}}`));
        });
    });
    */

  // activate tab buttons
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      if (menu.tabs[btn.id].setup !== null) menu.tabs[btn.id].setup();
      document.querySelector('.main').style.display = 'none';
      document.querySelector(menu.tabs[btn.id].tab).style.display = 'block';
      window.scrollTo(0, 0);
    });
  });

  // activate the back buttons on each tab
  document.querySelectorAll('.back-btn').forEach((btn) => {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab').forEach((tab) => {
        tab.style.display = 'none';
      });
      document.querySelector('.main').style.display = 'block';
    });
  });

  // give everything the appropirate i18n text
  document.querySelectorAll('[data-i18n]').forEach((text) => {
    text.innerText = chrome.i18n.getMessage(text.dataset.i18n);
  });

  // activate dark mode inspector button
  document
    .querySelector('#inspector-btn')
    .addEventListener('click', async function () {
      document.querySelector('#inspector-output').textContent = (
        await sendFromPopup('inspect')
      )['selectors'];
    });

  // activate dark mode fixer button
  document
    .querySelector('#fix-dm-btn')
    .addEventListener('click', async function () {
      let output = await sendFromPopup('fixdm');
      if (
        output.path === 'bettercanvas-none' ||
        output.path === 'bettercanvas-darkmode_off'
      )
        return;
      let rating = 'bad';
      if (output.time < 100) {
        rating = 'good';
      } else if (output.time < 250) {
        rating = 'ok';
      }
      document.getElementById('fix-dm-output').textContent =
        'Fix took ' + Math.round(output.time) + 'ms (rating: ' + rating + ')';
      chrome.storage.sync.get('dark_mode_fix', (sync) => {
        if (sync['dark_mode_fix'].includes(output.path)) return;
        sync['dark_mode_fix'].push(output.path);
        chrome.storage.sync
          .set({ dark_mode_fix: sync['dark_mode_fix'] })
          .then(() => displayDarkModeFixUrls());
      });
    });

  // activate storage dump button
  document.querySelector('#rk_btn').addEventListener('click', () => {
    chrome.storage.local.get(null, (local) => {
      chrome.storage.sync.get(null, (sync) => {
        document.querySelector('#rk_output').value =
          JSON.stringify(local) + JSON.stringify(sync);
      });
    });
  });

  // activate storage reset button
  document.querySelector('#storage-reset-btn').addEventListener('click', () => {
    chrome.storage.sync.set(defaultOptions['sync']);
  });

  // activate custom url input
  document
    .querySelector('#customDomain')
    .addEventListener('input', function () {
      let domains = this.value.split(',');
      domains.forEach((domain, index) => {
        let val = domain.replace(' ', '');
        if (val === '') return;
        //if (!val.includes("https://") && !val.includes("http://")) val = "https://" + val;
        try {
          let url = new URL(val);
          domains[index] = url.hostname;
          clearAlert();
        } catch (e) {
          domains[index] = val;
          displayAlert(
            true,
            'The URL you entered appears to be invalid, so it might not work.',
          );
        }
      });
      chrome.storage.sync.set({ custom_domain: domains });
    });

  // setup custom url
  chrome.storage.sync.get(['custom_domain'], (storage) => {
    document.querySelector('#customDomain').value = storage.custom_domain
      ? storage.custom_domain
      : '';
  });

  // activate import input box
  document.querySelector('#import-input').addEventListener('input', (e) => {
    const obj = JSON.parse(e.target.value);
    importTheme(obj);
  });

  // activate export checkbox
  document.querySelectorAll('.export-details input').forEach((input) => {
    input.addEventListener('change', () => {
      chrome.storage.sync.get(
        syncedSwitches
          .concat(syncedSubOptions)
          .concat([
            'dark_preset',
            'custom_cards',
            'custom_font',
            'gpa_calc_bounds',
          ]),
        async (storage) => {
          //chrome.storage.local.get(["dark_preset"], async local => {
          let final = {};
          for await (item of document.querySelectorAll(
            '.export-details input',
          )) {
            if (item.checked) {
              switch (item.id) {
                case 'export-toggles':
                  final = {
                    ...final,
                    ...(await getExport(
                      storage,
                      syncedSwitches.concat(syncedSubOptions),
                    )),
                  };
                  break;
                case 'export-dark':
                  final = {
                    ...final,
                    ...(await getExport(storage, ['dark_preset'])),
                  };
                  break;
                case 'export-cards':
                  final = {
                    ...final,
                    ...(await getExport(storage, ['custom_cards'])),
                  };
                  break;
                case 'export-font':
                  final = {
                    ...final,
                    ...(await getExport(storage, ['custom_font'])),
                  };
                  break;
                case 'export-colors':
                  final = {
                    ...final,
                    ...(await getExport(storage, ['card_colors'])),
                  };
                  break;
                case 'export-gpa':
                  final = {
                    ...final,
                    ...(await getExport(storage, ['gpa_calc_bounds'])),
                  };
                  break;
              }
            }
          }
          document.querySelector('#export-output').value =
            JSON.stringify(final);
          //});
        },
      );
    });
  });

  // activate revert to original button
  document.querySelector('#theme-revert').addEventListener('click', () => {
    chrome.storage.local.get('previous_theme', (local) => {
      if (local['previous_theme'] !== null) {
        importTheme(local['previous_theme']);
      }
    });
  });

  document.querySelector('#alert').addEventListener('click', clearAlert);

  document
    .querySelectorAll('.preset-button.customization-button')
    .forEach((btn) => btn.addEventListener('click', changeToPresetCSS));

  // activate card color inputs
  document
    .querySelector('#singleColorInput')
    .addEventListener(
      'change',
      (e) =>
        (document.querySelector('#singleColorText').value = e.target.value),
    );
  document
    .querySelector('#singleColorText')
    .addEventListener(
      'change',
      (e) =>
        (document.querySelector('#singleColorInput').value = e.target.value),
    );
  document
    .querySelector('#gradientColorFrom')
    .addEventListener(
      'change',
      (e) =>
        (document.querySelector('#gradientColorFromText').value =
          e.target.value),
    );
  document
    .querySelector('#gradientColorFromText')
    .addEventListener(
      'change',
      (e) =>
        (document.querySelector('#gradientColorFrom').value = e.target.value),
    );
  document
    .querySelector('#gradientColorTo')
    .addEventListener(
      'change',
      (e) =>
        (document.querySelector('#gradientColorToText').value = e.target.value),
    );
  document
    .querySelector('#gradientColorToText')
    .addEventListener(
      'change',
      (e) =>
        (document.querySelector('#gradientColorTo').value = e.target.value),
    );
  document.querySelector('#setSingleColor').addEventListener('click', () => {
    let colors = [document.querySelector('#singleColorInput').value];
    sendFromPopup('setcolors', colors);
  });
  document.querySelector('#setGradientColor').addEventListener('click', () => {
    chrome.storage.sync.get('custom_cards', (sync) => {
      length = 0;
      Object.keys(sync['custom_cards']).forEach((key) => {
        if (sync['custom_cards'][key].hidden !== true) length++;
      });
      let colors = [];
      let from = document.querySelector('#gradientColorFrom').value;
      let to = document.querySelector('#gradientColorTo').value;
      for (let i = 1; i <= length; i++) {
        colors.push(getColorInGradient(i / length, from, to));
      }
      sendFromPopup('setcolors', colors);
    });
  });

  // activate revert to original card colors button
  document.querySelector('#revert-colors').addEventListener('click', () => {
    chrome.storage.local.get('previous_colors', (local) => {
      if (local['previous_colors'] !== null) {
        sendFromPopup('setcolors', local['previous_colors'].colors);
      }
    });
  });

  // activate every card color palette button
  document.querySelectorAll('.preset-button.colors-button').forEach((btn) => {
    const colors = getPalette(btn.querySelector('p').textContent);
    let preview = btn.querySelector('.colors-preview');
    colors.forEach((color) => {
      let div = makeElement('div', preview, { className: 'color-preview' });
      div.style.background = color;
    });
    btn.addEventListener('click', () => {
      sendFromPopup('setcolors', colors);
    });
  });

  /*
    ['autodark_start', 'autodark_end'].forEach(function (timeset) {
        document.querySelector('#' + timeset).addEventListener('change', function () {
            let timeinput = { "hour": this.value.split(':')[0], "minute": this.value.split(':')[1] };
            timeset === "autodark_start" ? chrome.storage.sync.set({ auto_dark_start: timeinput }) : chrome.storage.sync.set({ auto_dark_end: timeinput });
        });
    });
    */

  // activate sidebar tool radio
  [
    '#radio-sidebar-image',
    '#radio-sidebar-gradient',
    '#radio-sidebar-solid',
  ].forEach((radio) => {
    document.querySelector(radio).addEventListener('click', () => {
      chrome.storage.sync.get(['dark_preset'], (storage) => {
        let mode =
          radio === '#radio-sidebar-image'
            ? 'image'
            : radio === '#radio-sidebar-gradient'
            ? 'gradient'
            : 'solid';
        displaySidebarMode(mode, storage['dark_preset']['sidebar']);
      });
    });
  });

  // theme browser controls
  document
    .getElementById('premade-themes-left')
    .addEventListener('click', () => changePage(-1));
  document
    .getElementById('premade-themes-right')
    .addEventListener('click', () => changePage(1));
  document.getElementById('theme-sorts').addEventListener('click', () => {
    const el = document.getElementById('theme-sort-selector');
    if (el.classList.contains('open')) {
      clickout();
    } else {
      el.classList.add('open');
      setTimeout(() => {
        document.addEventListener('click', clickout);
      }, 10);
    }
  });
  document
    .getElementById('theme-search')
    .addEventListener('change', async (e) => {
      searchFor = e.target.value;
      current_page_num = 1;
      displayThemeList(0);
    });

  // activate theme save button
  document
    .getElementById('save-theme')
    .addEventListener('click', saveCurrentTheme);

  // activate submit theme button
  document
    .getElementById('submit-theme-btn')
    .addEventListener('click', submitTheme);

  document
    .getElementById('submit-theme-btn-1')
    .addEventListener('click', () => {
      document.getElementById('submit-popup').classList.add('open');
    });

  document.getElementById('cancel-theme-btn').addEventListener('click', () => {
    document.getElementById('submit-popup').classList.remove('open');
  });

  // update theme button preview on input
  document.getElementById('submit-title').addEventListener('input', (e) => {
    document.getElementById('theme-button-title-preview').textContent =
      e.target.value.replaceAll(' ', '');
  });

  // update theme button preview on input
  document.getElementById('submit-credits').addEventListener('input', (e) => {
    document.getElementById('theme-button-creator-preview').textContent =
      e.target.value;
  });

  // activate the show button to open the theme submission drawer
  document.getElementById('show-submit-form').addEventListener('click', (e) => {
    const drawer = document.getElementById('submit-drawer');
    if (drawer.style.display === 'none') {
      drawer.style.display = 'block';
      e.target.textContent = 'Hide';
    } else {
      drawer.style.display = 'none';
      e.target.textContent = 'Show';
    }
  });

  // activate theme browser opt out
  document.getElementById('new_browser_out').addEventListener('click', () => {
    chrome.storage.sync.set({ new_browser: false });
    current_page_num = 1;
    displayThemeList(0);
    displayAlert(
      false,
      'Success! You are now viewing the old theme browser. This one will no longer recieve updates, but there is still plenty to choose from.',
    );
  });

  // activate theme browser opt in
  document
    .getElementById('new_browser_in')
    .addEventListener('click', registerUser);

  document.querySelectorAll('.theme-sort-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      themeSort(e.target.textContent);
    });
  });

  // browser settings buttons
  document
    .getElementById('browser-settings-btn')
    .addEventListener('click', () => {
      document.getElementById('browser-settings-popup').classList.add('open');
    });

  document
    .getElementById('close-settings-btn')
    .addEventListener('click', () => {
      displayThemeList(0);
      document
        .getElementById('browser-settings-popup')
        .classList.remove('open');
    });

  document.getElementById('reset-optin').addEventListener('click', () => {
    chrome.storage.sync.set({ new_browser: null });
    document.getElementById('opt-in').style.display = 'block';
  });

  document
    .getElementById('view-submissions-btn')
    .addEventListener('click', displayMySubmissions);
  document
    .getElementById('submit-form-btn')
    .addEventListener('click', displayThemeSubmissionForm);
}

function setupCustomStyle(initial) {
  const el = document.getElementById('custom-styles');
  el.value = initial;
  el.addEventListener('change', (e) => {
    chrome.storage.sync.set({ custom_styles: e.target.value });
  });
}

function displayThemeSubmissionForm() {
  document.getElementById('submit-form').style.display = 'block';
  document.getElementById('view-submissions').style.display = 'none';
  document.getElementById('submit-form-btn').classList.add('active');
  document.getElementById('view-submissions-btn').classList.remove('active');
}

async function displayMySubmissions() {
  const sync = await chrome.storage.sync.get('id');
  const res = await fetch(`${apiurl}/api/themes/submissions?id=${sync['id']}`);
  const data = await res.json();

  //if (data?.errors !== false) return;

  document.getElementById('submit-form').style.display = 'none';
  document.getElementById('view-submissions').style.display = 'block';
  document.getElementById('submit-form-btn').classList.remove('active');
  document.getElementById('view-submissions-btn').classList.add('active');

  const el = document.getElementById('latest-submissions');
  el.textContent = '';

  if (data.message.length === 0) {
    el.textContent = "You haven't submitted any themes yet.";
  }

  data.message.forEach((theme) => {
    const container = makeElement('div', el, { className: 'submitted-theme' });
    const btn = makeElement('button', container, {
      className: 'theme-button clickable customization-button',
      style: `min-width:105px;max-width:105px;background-image:linear-gradient(rgba(0, 0, 0, 0.44), rgba(0, 0, 0, 0.44)), url(${theme.preview})`,
    });
    const title = makeElement('p', btn, {
      className: 'theme-button-title clickable',
      textContent: theme.title,
    });
    const credits = makeElement('p', btn, {
      className: 'theme-button-creator clickable',
      textContent: theme.credits,
    });
    const details = makeElement('div', container, {
      className: 'submitted-theme-details',
    });
    const top = makeElement('div', details, {
      style: 'display:flex;justify-content:space-between;align-items:center',
    });
    const tag = makeElement('span', top, {
      className: 'submitted-theme-tag',
      textContent:
        theme.approved === 1
          ? 'Approved'
          : theme.approved === 0
          ? 'Pending'
          : 'Rejected',
      style: `background: ${
        theme.approved === 1
          ? '#ad3a74'
          : theme.approved === 0
          ? '#514e4e'
          : '#000'
      }`,
    });
    const msg = makeElement('p', details, {
      textContent:
        theme.approved === 1
          ? 'Looks great! Thanks for submitting'
          : theme.approved === 0
          ? 'Your theme is still awaiting approval.'
          : `Your theme was rejected${
              theme.reason
                ? ': ' + theme.reason
                : ' because it did not meet the theme guidelines.'
            }`,
    });
    const ago = makeElement('span', top, {
      className: 'submitted-theme-time',
      textContent: `${
        getRelativeDate(new Date(parseInt(theme.time))).time
      } ago`,
    });
  });
}

async function getExport(storage, options) {
  let final = {};
  for (const option of options) {
    switch (option) {
      case 'custom_cards':
        let arr = [];
        Object.keys(storage['custom_cards']).forEach((key) => {
          if (storage['custom_cards'][key].img !== '')
            arr.push(storage['custom_cards'][key].img);
        });
        if (arr.length === 0) {
          arr = ['none'];
        }
        final['custom_cards'] = arr;
        break;
      case 'card_colors':
        final['card_colors'] = [];
        try {
          final['card_colors'] = await sendFromPopup('getcolors');
        } catch (e) {
          console.log(e);
        }
        break;
      default:
        final[option] = storage[option];
    }
  }
  return final;
}

let pageTimeout = false;

function changePage(direction) {
  if (pageTimeout) return;
  pageTimeout = true;
  displayThemeList(direction);
  setTimeout(() => {
    pageTimeout = false;
  }, 500);
}

const colorValues = {
  red: 1,
  pink: 2,
  orange: 3,
  yellow: 4,
  lightgreen: 5,
  green: 6,
  lightblue: 7,
  blue: 8,
  lightpurple: 9,
  purple: 10,
  lightpurple: 11,
  beige: 12,
  brown: 13,
  gray: 14,
};

function themeSortFn(method) {
  let themes = getTheme('all');
  switch (method) {
    case 'New':
      return themes.reverse();
    case 'Old':
      return themes;
    case 'Color':
      return themes.sort((a, b) => {
        //return (colorValues[a.color] || 88) - (colorValues[b.color] || 88)
        return (
          (colorValues[a.color] ||
            (a.color !== 'whiteblack' && a.color.includes('white') ? 15 : 16)) -
          (colorValues[b.color] ||
            (b.color !== 'whiteblack' && b.color.includes('white') ? 15 : 16))
        );
      });
      return themes.sort((a, b) => {
        return a.color < b.color ? 1 : -1;
      });
    case 'ABC':
      return themes.sort((a, b) => {
        return a.title.toLowerCase() > b.title.toLowerCase() ? 1 : -1;
      });
    default:
      return shuffle(themes).sort((a, b) => {
        a = a.score + '';
        b = b.score + '';
        a =
          parseInt(a.charAt(0)) +
          parseInt(a.charAt(1)) +
          parseInt(a.charAt(2)) +
          parseInt(a.charAt(3));
        b =
          parseInt(b.charAt(0)) +
          parseInt(b.charAt(1)) +
          parseInt(b.charAt(2)) +
          parseInt(b.charAt(3));
        return b - a;
      });
  }
}

let cache = {};

// new theme sort button
function themeSort(sort) {
  current_sort = sort;
  current_page_num = 1;
  allThemes = themeSortFn(current_sort);
  displayThemeList(0);
}

function clickout() {
  setTimeout(() => {
    document.getElementById('theme-sort-selector').classList.remove('open');
    document.removeEventListener('click', clickout);
  }, 10);
}

/*
function sortThemes(method) {
    const sortMethods = ["Popular", "ABC", "New", "Old"];
    const index = sortMethods.indexOf(method);
    const next = index + 1 === sortMethods.length ? 0 : index + 1;
    current_sort = sortMethods[next];
    allThemes = themeSortFn(current_sort);
    document.querySelectorAll(".theme-sort-btn").forEach(btn => {
        if (btn.id.includes(method)) {
            btn.style.color = "#fff";
            btn.style.background = "var(--inputbg)"
        } else {
            btn.style.color = "#adadad";
            btn.style.background = "none"
        }
    });
    current_page_num = 1;
    displayThemeList(0);
    //cache = {};
}
    */

// shuffle function for the score sorting so theres no order bias
function shuffle(arr) {
  var j, x, index;
  for (index = arr.length - 1; index > 0; index--) {
    j = Math.floor(Math.random() * (index + 1));
    x = arr[index];
    arr[index] = arr[j];
    arr[j] = x;
  }
  return arr;
}

let current_page_num = 1;
let maxPage = 0;
let searchFor = '';
let current_sort = 'Popular';
let allThemes = themeSortFn(current_sort);

//sortThemes(current_sort);

function shortScore(score) {
  if (score >= 1400) {
    return (
      Math.floor(score / 1000) + '.' + Math.round((score % 1000) / 100) + 'k'
    );
  }
  return score;
}

let fallback = false;

async function submitTheme() {
  const sync = await chrome.storage.sync.get(null);

  if (sync['new_browser'] !== true) {
    displayAlert(
      true,
      "You'll need to opt in to the new browser if you want to submit your theme. If you've opted out and want to opt in, you can scroll down to the bottom of this page and opt back in.",
    );
    return;
  }

  const theme = await getExport(sync, [
    'custom_cards',
    'card_colors',
    'dark_preset',
    'custom_font',
    'gradient_cards',
    'disable_color_overlay',
  ]);
  const title = document.getElementById('submit-title');
  const credits = document.getElementById('submit-credits');

  if (title.value === '') {
    displayAlert(true, "The title of your theme can't be empty");
    return;
  }

  if (credits.value === '') {
    displayAlert(true, "The credits for your theme can't be empty");
    return;
  }
  const body = JSON.stringify({
    identity: sync['id'],
    title: title.value,
    credits: credits.value,
    theme: JSON.stringify(theme),
  });

  fetch(`${apiurl}/api/themes/submit`, {
    method: 'POST',
    body: body,
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((res) => res.json())
    .then((data) => {
      console.log(data);
      if (data.errors === false) {
        displayAlert(
          false,
          'Thanks for submitting your theme! I will try to approve it soon, but not every theme may be accepted.',
        );
        document.getElementById('submit-popup').classList.remove('open');
      } else {
        displayAlert(
          true,
          `Submission error: ${data.message} Please contact ksucpea@gmail.com if you believe this is incorrect.`,
        );
      }
    });
}

async function registerUser() {
  try {
    let id;

    const sync = await chrome.storage.sync.get('id');

    if (sync['id'] && sync['id'] !== '') {
      id = sync['id'];
    } else {
      const res = await fetch(`${apiurl}/api/register`);
      const data = await res.json();
      id = data.id;
    }

    chrome.storage.sync
      .set({ id: id })
      .then(async () => {
        // test to see if the id was set correctly
        // don't know why this is happening ??
        const test = await chrome.storage.sync.get('id');
        if (test['id'] === undefined || test['id'] === '') throw new Error();

        // show the new browser
        chrome.storage.sync.set({ new_browser: true }).then(() => {
          document.getElementById('opt-in').style.display = 'none';
          current_page_num = 1;
          displayThemeList(0);
          displayAlert(
            false,
            'Success! You should be able to see the new themes browser now. Enjoy!',
          );
        });
      })
      .catch((e) => {
        displayAlert(
          true,
          'There was an error connecting an ID to your account. Please try again, and if this error persists, contact ksucpea@gmail.com!',
        );
      });
  } catch (e) {
    console.log(e);
    displayAlert(
      true,
      'There was an error opting in. Please contact ksucpea@gmail.com if this error persists!',
    );
  }
}

function saveCurrentTheme() {
  const allOptions = syncedSwitches
    .concat(syncedSubOptions)
    .concat([
      'dark_preset',
      'custom_cards',
      'custom_font',
      'gpa_calc_bounds',
      'card_colors',
    ]);
  chrome.storage.local.get('saved_themes', (local) => {
    chrome.storage.sync.get(allOptions, async (sync) => {
      let current = await getExport(sync, allOptions);
      let trimmed = {
        disable_color_overlay: current['disable_color_overlay'],
        gradient_cards: current['gradient_cards'],
        dark_mode: current['dark_mode'],
        dark_preset: current['dark_preset'],
        custom_cards: current['custom_cards'],
        card_colors:
          current['card_colors'] === null
            ? [current['dark_preset']['links']]
            : current['card_colors'],
        custom_font: current['custom_font'],
      };
      const now = new Date();
      local['saved_themes'][now.getTime()] = trimmed;
      chrome.storage.local
        .set({ saved_themes: local['saved_themes'] })
        .then(() => {
          displaySavedThemes();
        });
    });
  });
}

async function displayThemeList(direction = 0) {
  const sync = await chrome.storage.sync.get('new_browser');
  if (sync['new_browser'] === true && fallback === false) {
    displayThemeListNew(direction);
  } else {
    displayThemeListOld(direction);
  }
  // remove the opt-in notice
  if (sync['new_browser'] !== null && document.getElementById('opt-in'))
    document.getElementById('opt-in').style.display = 'none';
}

function createThemeButton(location, theme) {
  let themeBtn = makeElement('button', location, {
    className: 'theme-button clickable',
  });
  themeBtn.classList.add('customization-button');
  if (!themeBtn.style.background)
    themeBtn.style.backgroundImage =
      'linear-gradient(#00000070, #00000070), url(' + theme.preview + ')';
  if (theme.title)
    makeElement('p', themeBtn, {
      className: 'theme-button-title clickable',
      textContent: theme.title.replaceAll(' ', ''),
    });
  if (theme.credits)
    makeElement('p', themeBtn, {
      className: 'theme-button-creator clickable',
      textContent: theme.credits,
    });
  return themeBtn;
}

function createThemeLikeBtn(location, initial, score, show) {
  const likeBtn = makeElement('div', location, {
    className: 'theme-button-like',
  });
  if (initial === true) {
    likeBtn.classList.add('theme-liked');
    score += 1;
  }
  const amount = makeElement('span', likeBtn, {
    className: 'theme-button-like-amount',
    textContent: shortScore(score),
  });
  if (show === true) amount.classList.add('showalways');
  likeBtn.innerHTML += `<svg  xmlns="http://www.w3.org/2000/svg"  width="12"  height="12"  viewBox="0 0 24 24"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M6.979 3.074a6 6 0 0 1 4.988 1.425l.037 .033l.034 -.03a6 6 0 0 1 4.733 -1.44l.246 .036a6 6 0 0 1 3.364 10.008l-.18 .185l-.048 .041l-7.45 7.379a1 1 0 0 1 -1.313 .082l-.094 -.082l-7.493 -7.422a6 6 0 0 1 3.176 -10.215z" /></svg>`;
  return likeBtn;
}

let likeThemeTimeout = false;

function setLikeTimeout() {
  if (likeThemeTimeout === true) return;
  likeThemeTimeout = true;
  setTimeout(() => {
    likeThemeTimeout = false;
  }, 1000);
}

async function likeTheme(location, code, score) {
  if (likeThemeTimeout === true) return;

  const sync = await chrome.storage.sync.get('id');
  const local = await chrome.storage.local.get('liked_themes');

  const setLikeStatus = (direction) => {
    let output = local;

    if (direction === -1) {
      location.classList.remove('theme-liked');
      location.querySelector('.theme-button-like-amount').textContent =
        shortScore(score);
      output = local['liked_themes'].filter((x) => x !== code);
    } else if (direction === 1) {
      location.classList += ' theme-liked animate-like';
      location.querySelector('.theme-button-like-amount').textContent =
        shortScore(score + 1);
      output = [...local['liked_themes'], code];
    }

    return output;
  };

  // show the updated like status immediately
  setLikeStatus(location.classList.contains('theme-liked') ? -1 : 1);

  const res = await fetch(`${apiurl}/api/themes/theme/${code}/like`, {
    method: 'POST',
    body: JSON.stringify({ id: sync['id'] }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await res.json();

  if (data.errors === false) {
    const direction = parseInt(data.message);
    // update the like status if there is some disagreement with the server
    const update = setLikeStatus(direction);
    chrome.storage.local.set({ liked_themes: update }).then(setLikeTimeout);
  } else {
    setLikeTimeout();
  }
}

async function getAndLoadTheme(code) {
  const key = `themes/${code}`;
  let output = {};
  if (cache[key]) {
    output = cache[key];
    console.log('got this theme from the cache.');
  } else {
    const res = await fetch(`${apiurl}/api/themes/theme/${code}`);
    const data = await res.json();
    output = JSON.parse(data.message.exports);
    cache[key] = output;
  }
  importTheme(output);
}

async function displayThemeListNew(direction) {
  document.getElementById('theme-current-sort').textContent = current_sort;
  if (direction === -1 && current_page_num > 1) current_page_num--;
  if (direction === 1 && current_page_num < maxPage) current_page_num++;

  let themes = [];
  let apiLink =
    `${current_sort.toLowerCase()}?page=${current_page_num}` +
    (searchFor === '' ? '' : `&searchFor=${searchFor}`);
  if (current_sort === 'Liked') {
    const sync = await chrome.storage.sync.get('id');
    const local = await chrome.storage.local.get('liked_themes');
    if (sync['id'] && sync['id'] !== '') {
      apiLink += `&id=${sync['id']}`;
      maxPage = Math.ceil(local['liked_themes'].length / 28);
    } else {
      // fallback if there is no id
      current_page_num = 1;
      apiLink =
        `popular?page=${current_page_num}` +
        (searchFor === '' ? '' : `&searchFor=${searchFor}`);
    }
  }

  // fetch api, fallback if necessary
  if (cache[apiLink]) {
    themes = cache[apiLink]['themes'];
    maxPage = cache[apiLink]['pages'] || maxPage;
  } else {
    try {
      const res = await fetch(`${apiurl}/api/themes/${apiLink}`, {
        method: 'get',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (data.errors === true) throw new Error(data.message);
      themes = data.message.themes;
      cache[apiLink] = data.message;
      if (data?.message?.pages) {
        maxPage = data.message.pages;
      }
    } catch (e) {
      console.log(e);
      current_page_num = 1;
      fallback = true;
      displayAlert(
        true,
        'There was a problem getting themes from the Better Canvas server, so the old themes browser is being displayed for now.',
      );
      displayThemeListOld(0);
      return;
    }
  }

  let container = document.getElementById('premade-themes');
  container.textContent = '';

  const local = await chrome.storage.local.get('liked_themes');
  const sync = await chrome.storage.sync.get('browser_show_likes');

  themes.forEach((theme) => {
    const themeBtn = createThemeButton(container, theme);
    themeBtn.addEventListener('click', (e) => {
      if (!e.target.classList.contains('clickable')) return;
      getAndLoadTheme(theme.code);
    });

    const liked = local['liked_themes'].includes(theme.code);
    const likeBtn = createThemeLikeBtn(
      themeBtn,
      liked,
      theme.score,
      sync['browser_show_likes'],
    );
    likeBtn.addEventListener('click', (e) =>
      likeTheme(likeBtn, theme.code, theme.score),
    );
  });

  if (themes.length === 0) {
    container.innerHTML = `<div id="themes-empty">Nothing here</div>`;
  }

  document.getElementById('premade-themes-pagenum').textContent =
    current_page_num + ' of ' + maxPage;

  // set the submit theme button to the first custom card image

  try {
    const sync = await chrome.storage.sync.get('custom_cards');
    const exports = await getExport(sync, ['custom_cards']);
    document.getElementById(
      'theme-button-img',
    ).style.background = `linear-gradient(#00000070, #00000070), url(${exports['custom_cards'][0]}) no-repeat center center / cover`;
  } catch (e) {
    console.log(e);
  }

  displaySavedThemes();
}

function displayThemeListOld(pageDir = 0) {
  //const keys = Object.keys(themes);
  document.getElementById('theme-current-sort').textContent = current_sort;
  const perPage = 24;
  const maxPage = Math.ceil(allThemes.length / perPage);
  if (pageDir === -1 && current_page_num > 1) current_page_num--;
  if (pageDir === 1 && current_page_num < maxPage) current_page_num++;
  let container = document.getElementById('premade-themes');
  container.textContent = '';
  let start = (current_page_num - 1) * perPage,
    end = start + perPage;
  allThemes.forEach((theme, index) => {
    if (index < start || index >= end) return;
    let themeBtn = makeElement('button', container, {
      className: 'theme-button',
    });
    themeBtn.classList.add('customization-button');
    if (!themeBtn.style.background)
      themeBtn.style.backgroundImage =
        'linear-gradient(#00000070, #00000070), url(' + theme.preview + ')';
    let split = theme.title.split(' by ');
    makeElement('p', themeBtn, {
      className: 'theme-button-title',
      textContent: split[0],
    });
    makeElement('p', themeBtn, {
      className: 'theme-button-creator',
      textContent: split[1],
    });
    themeBtn.addEventListener('click', () => {
      const allOptions = syncedSwitches
        .concat(syncedSubOptions)
        .concat([
          'dark_preset',
          'custom_cards',
          'custom_font',
          'gpa_calc_bounds',
          'card_colors',
        ]);
      chrome.storage.sync.get(allOptions, (sync) => {
        chrome.storage.local.get(['previous_theme'], async (local) => {
          if (local['previous_theme'] === null) {
            let previous = await getExport(sync, allOptions);
            chrome.storage.local.set({ previous_theme: previous });
          }
          importTheme(theme.exports);
        });
      });
    });
  });
  document.getElementById('premade-themes-pagenum').textContent =
    current_page_num + ' of ' + maxPage;
  displaySavedThemes();
}

function getRelativeDate(date, short = false) {
  let now = new Date();
  let timeSince = (now.getTime() - date.getTime()) / 60000;
  let time = 'min';
  timeSince = Math.abs(timeSince);
  if (timeSince >= 60) {
    timeSince /= 60;
    time = short ? 'h' : 'hour';
    if (timeSince >= 24) {
      timeSince /= 24;
      time = short ? 'd' : 'day';
      if (timeSince >= 7) {
        timeSince /= 7;
        time = short ? 'w' : 'week';
      }
    }
  }
  timeSince = Math.round(timeSince);
  let relative =
    timeSince +
    (short ? '' : ' ') +
    time +
    (timeSince > 1 && !short ? 's' : '');
  return { time: relative, ms: now.getTime() - date.getTime() };
}

function displaySavedThemes() {
  chrome.storage.local.get('saved_themes', (local) => {
    const target = document.getElementById('saved-themes');
    target.textContent = '';
    Object.keys(local['saved_themes']).forEach((key, index) => {
      const created = new Date(parseInt(key));
      let btn = makeElement('div', target, { className: 'saved-theme' });
      let title = makeElement('p', btn, {
        className: 'theme-button-title',
        textContent: `Theme ${index + 1}`,
      });
      let date = makeElement('p', btn, {
        className: 'theme-button-creator',
        textContent: `${getRelativeDate(created).time} ago`,
      });
      let remove = makeElement('div', btn, {
        className: 'theme-button-remove',
        textContent: 'x',
      });
      btn.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.44), rgba(0, 0, 0, 0.44)), url(${local['saved_themes'][key]['custom_cards'][0]})`;
      btn.addEventListener('click', () => {
        importTheme(local['saved_themes'][key]);
      });
      remove.addEventListener('click', () => {
        chrome.storage.local.get('saved_themes', (local) => {
          delete local['saved_themes'][key];
          chrome.storage.local
            .set({ saved_themes: local['saved_themes'] })
            .then(() => {
              btn.remove();
            });
        });
      });
    });
  });
}

function getTheme(name) {
  const themes = [
    {
      color: 'brown',
      score: 4441,
      title: 'Capybara by ksucpea',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        card_colors: ['#755215'],
        custom_font: { family: "'Rubik'", link: 'Rubik:wght@400;700' },
        dark_preset: {
          'background-0': '#170d03',
          'background-1': '#251c04',
          'background-2': '#0c0c0c',
          borders: '#1e1e1e',
          links: '#dfa581',
          sidebar: 'linear-gradient(#9b5a32, #1e1506)',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/ca/93/0c/ca930c4f2edd5012863a38182759bfb5.gif',
          'https://i.ytimg.com/vi/FWcoYPoD6us/maxresdefault.jpg',
          'https://i.redd.it/kc2xbmo8kiy71.jpg',
          'https://i.gifer.com/7Luh.gif',
          'https://media.tenor.com/fdT-j77p2D4AAAAd/capybara-eating.gif',
          'https://media.tenor.com/1kZ2j73pGDUAAAAC/capybara-ok-he-pull-up.gif',
        ],
      },
      preview: 'https://i.redd.it/kc2xbmo8kiy71.jpg',
    },
    {
      color: 'brown',
      score: 4441,
      title: 'Minecraft by ksucpea',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#29180a',
          'background-1': '#23651a',
          'background-2': '#20691b',
          borders: '#584628',
          links: '#88df81',
          sidebar: '#478906',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/68/86/fc/6886fcfaeb5a4f8f6812e5828be48a8b.jpg',
          'https://i.pinimg.com/236x/3b/d7/24/3bd7241c49a73faa34ab9fd143c6aeab.jpg',
          'https://i.pinimg.com/236x/13/65/be/1365be0d1dfb50fd029b7263ebbac4cb.jpg',
          'https://i.pinimg.com/236x/00/ea/44/00ea44a404526888ca7f97177dc425bb.jpg',
          'https://i.pinimg.com/236x/4c/af/e4/4cafe411bec7d26e709fa60a5f8b60d3.jpg',
          'https://i.pinimg.com/564x/55/77/f0/5577f03d6369372c6a411812eedf61f8.jpg',
        ],
        card_colors: ['#88df81'],
        custom_font: {
          family: "'Silkscreen'",
          link: 'Silkscreen:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/236x/00/ea/44/00ea44a404526888ca7f97177dc425bb.jpg',
    },
    {
      color: 'blue',
      score: 4340,
      title: 'Ocean by Grant',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#212838',
          'background-1': '#1a2026',
          'background-2': '#212930',
          borders: '#2e3943',
          sidebar: '#1a2026',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
          links: '#56Caf0',
          'sidebar-text': '#f5f5f5',
        },
        custom_cards: [
          'https://gifdb.com/images/high/shark-school-swarming-ocean-8zqd4b90h7j8r8is.gif',
          'https://media1.giphy.com/media/Y4K9JjSigTV1FkgiNE/200w.webp?cid=ecf05e47qvqduufaxfzre6akpzg4ikbdx9f8f779krrkb89n&ep=v1_gifs_search&rid=200w.webp&ct=g',
          'https://media4.giphy.com/media/htdnXEhlPDVDZI3CMu/200w.webp?cid=ecf05e47qvqduufaxfzre6akpzg4ikbdx9f8f779krrkb89n&ep=v1_gifs_search&rid=200w.webp&ct=g',
          'https://i.gifer.com/6jDi.gif',
          'https://i.redd.it/2p9in2g3va2b1.gif',
        ],
        card_colors: ['#32f6cc', '#31eece', '#30e7cf', '#2fdfd1', '#2ed8d2'],
        custom_font: { link: 'Comfortaa:wght@400;700', family: "'Comfortaa'" },
      },
      preview:
        'https://media4.giphy.com/media/htdnXEhlPDVDZI3CMu/200w.webp?cid=ecf05e47qvqduufaxfzre6akpzg4ikbdx9f8f779krrkb89n&ep=v1_gifs_search&rid=200w.webp&ct=g',
    },
    {
      color: 'purple',
      score: 4430,
      title: 'Pokemon by Jason',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#110c12',
          'background-1': '#704776',
          'background-2': '#5b3960',
          borders: '#836487',
          links: '#f5a8ff',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), url("https://64.media.tumblr.com/c6e4deca70a7e430d8ebe7a6266c4cc1/tumblr_n6gqw4EGiW1tvub8wo1_500.png")',
          'sidebar-text': '#ffffff',
          'text-0': '#ffffff',
          'text-1': '#c7c7c7',
          'text-2': '#adadad',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/94/29/67/942967bd1f4651e00f019aeddaf10851.jpg',
          'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRZGt2iwyDxBuKJmIalhxlkUM_a_PRUpqEqAcbqO_ZXToer3x9Z',
          'https://i.pinimg.com/originals/96/c1/65/96c1651cc85f05e22390eac2a7e76978.png',
          'https://i.pinimg.com/originals/62/a6/1c/62a61c78a2228e23c14fb5b27951c5df.jpg',
          'https://i.pinimg.com/564x/2f/75/11/2f751137735438b81e3abd3bd954b901.jpg',
        ],
        card_colors: ['#e0aaff', '#c77dff', '#9d4edd', '#7b2cbf', '#5a189a'],
        custom_font: { family: "'Rubik'", link: 'Rubik:wght@400;700' },
      },
      preview:
        'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRZGt2iwyDxBuKJmIalhxlkUM_a_PRUpqEqAcbqO_ZXToer3x9Z',
    },
    {
      color: 'pink',
      score: 4440,
      title: 'Kirby by Siri',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fbc1cf',
          'background-1': '#ae2d45',
          'background-2': '#5b3960',
          borders: '#ae2d45',
          links: '#ae2d45',
          sidebar: '#ae2d45',
          'sidebar-text': '#ffffff',
          'text-0': '#292929',
          'text-1': '#000000',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/30/19/ab/3019ab7b9f6d2b230a6178231ba3817a.jpg',
          'https://i.pinimg.com/236x/f0/52/d9/f052d9d8867b66ca7942cf4a2a6c968b.jpg',
          'https://i.pinimg.com/564x/2e/f0/70/2ef0705eb021d59065239dd553661d4f.jpg',
          'https://i.pinimg.com/236x/36/a4/73/36a47369afbdb6e91544af173fb0e92d.jpg',
          'https://i.pinimg.com/236x/6a/9c/60/6a9c604d4070e6d03e15717472851356.jpg',
        ],
        card_colors: ['#ae2d45'],
        custom_font: { family: "'Rubik'", link: 'Rubik:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/236x/30/19/ab/3019ab7b9f6d2b230a6178231ba3817a.jpg',
    },
    {
      color: 'red',
      score: 4440,
      title: 'McDonalds by cmoon3611',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#CB2115',
          'background-1': '#FFC72C',
          'background-2': '#FFC72C',
          borders: '#FFC72C',
          links: '#FFC72C',
          sidebar: '#FFC72C',
          'sidebar-text': '#514010',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/03/c3/b7/03c3b7ce47480a7dc6f2fbbb4eee730f.jpg',
          'https://i.pinimg.com/236x/3e/39/ef/3e39ef786197b2694b34c51ab511dddb.jpg',
          'https://i.pinimg.com/236x/f8/31/bd/f831bd305b19e9d67471afb4f778e697.jpg',
          'https://i.pinimg.com/236x/a6/5d/ee/a65dee0c9aeea08bc850f9be5eb8d4dc.jpg',
          'https://i.pinimg.com/236x/27/a9/5c/27a95c0aefc2d5f260088fd409bb6dd0.jpg',
          'https://i.pinimg.com/236x/90/9c/eb/909ceb03715e98844f0d617b34740157.jpg',
        ],
        card_colors: ['#ffc72c'],
        custom_font: { family: "'Poppins'", link: 'Poppins:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/236x/03/c3/b7/03c3b7ce47480a7dc6f2fbbb4eee730f.jpg',
    },
    {
      color: 'black',
      score: 4340,
      title: 'Wavy by Siri',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#080808',
          'background-1': '#0a0a0a',
          'background-2': '#0a0a0a',
          borders: '#2e2b3b',
          links: '#b1a2fb',
          sidebar:
            'linear-gradient(#101010c7, #101010c7), url("https://i.pinimg.com/236x/80/f6/1f/80f61fadd498cd8201b678a8cdee2746.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/b2/ff/99/b2ff994c598a5916ca250fd6429a3c01.jpg',
          'https://i.pinimg.com/236x/34/41/9d/34419d09e540d062a6b43df26c626c20.jpg',
          'https://i.pinimg.com/236x/c0/d4/cc/c0d4cc0d7041fec03fa21f856a33431c.jpg',
          'https://i.pinimg.com/236x/bf/46/67/bf4667a532b874050eb477bd891f0551.jpg',
          'https://i.pinimg.com/236x/ce/0b/8b/ce0b8baaea85445b86d87a610231cf82.jpg',
          'https://i.pinimg.com/236x/65/c4/ca/65c4ca10b0270634404f2614f30ad684.jpg',
        ],
        card_colors: [
          '#267282',
          '#d53825',
          '#1bb0b7',
          '#c94b43',
          '#8ebaa6',
          '#4c8cc4',
        ],
        custom_font: {
          family: "'Chakra Petch'",
          link: 'Chakra+Petch:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/236x/34/41/9d/34419d09e540d062a6b43df26c626c20.jpg',
    },
    {
      color: 'blue',
      score: 3340,
      title: 'Totoro by Matt',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#102623',
          'background-1': '#204744',
          'background-2': '#35573c',
          borders: '#35573c',
          'text-0': '#9dd0d4',
          'text-1': '#fafcfb',
          'text-2': '#fafcfb',
          links: '#72a06f',
          sidebar: '#204744',
          'sidebar-text': '#9dd0d4',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/0e/d9/7b/0ed97b4de4a7ebd19192dca03bac0ced.gif',
          'https://i.pinimg.com/564x/b1/af/4a/b1af4a2171930f55dbb625a86676751a.jpg',
          'https://i.pinimg.com/originals/46/a4/b8/46a4b82ea673d390348309cb65e3b357.gif',
          'https://i.pinimg.com/564x/a5/a6/f5/a5a6f5446e9366d6c40f0bef29fe1f1a.jpg',
          'https://i.pinimg.com/originals/7d/04/0e/7d040e94931427709008aaeda14db9c8.gif',
          'https://i.pinimg.com/originals/fd/b7/b1/fdb7b175cd15b48429fa97bbaa817b08.gif',
          'https://i.pinimg.com/originals/d8/aa/d9/d8aad938f2beea672124ebf1309584c7.gif',
          'https://i.pinimg.com/originals/07/96/ba/0796badd897daf8b7230da64a97c612c.gif',
          'https://i.pinimg.com/originals/46/f7/39/46f7399d22f0f45c14bffd2586691fe0.gif',
        ],
        card_colors: ['#023047', '#856003', '#4b6979', '#187288', '#b56000'],
        custom_font: { link: 'Jost:wght@400;700', family: "'Jost'" },
      },
      preview:
        'https://i.pinimg.com/564x/a5/a6/f5/a5a6f5446e9366d6c40f0bef29fe1f1a.jpg',
    },
    {
      color: 'lightpurple',
      score: 4440,
      title: 'Cinnamoroll by Melina',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e0e2ff',
          'background-1': '#b4b9fe',
          'background-2': '#5b3960',
          borders: '#b4b9fe',
          links: '#707aff',
          sidebar: '#b4b9fe',
          'sidebar-text': '#ffffff',
          'text-0': '#292929',
          'text-1': '#000000',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/0d/bd/ed/0dbdedfd3febc08b4f5bdba114175c10.jpg',
          'https://i.pinimg.com/564x/f7/b4/d3/f7b4d3f23d63fea99b32c4fcd1c169a1.jpg',
          'https://i.pinimg.com/564x/00/ad/d4/00add4dc2b6a7af6a13232ceec5252bf.jpg',
          'https://i.pinimg.com/564x/44/a6/41/44a641d70ef3d2e46ba8c95c25517287.jpg',
          'https://i.pinimg.com/564x/89/9e/62/899e62954d087597fc3b88f6e07b3640.jpg',
        ],
        card_colors: ['#707aff'],
        custom_font: { family: "'Poppins'", link: 'Poppins:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/00/ad/d4/00add4dc2b6a7af6a13232ceec5252bf.jpg',
    },
    {
      color: 'lightgreen',
      score: 4441,
      title: 'Ghibli by Francine',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e6e6e6',
          'background-1': '#f5f5f5',
          'background-2': '#d4d4d4',
          borders: '#c7cdd1',
          links: '#738678',
          sidebar: '#738678',
          'sidebar-text': '#ffffff',
          'text-0': '#4d5d53',
          'text-1': '#777e72',
          'text-2': '#a5a5a5',
        },
        custom_cards: [
          'https://media1.tenor.com/m/d_Yb1KEUhgEAAAAC/lvrnjm-warawara.gif',
          'https://media.tenor.com/JYgEKjfi3uIAAAAM/anim-howls-moving-castle.gif',
          'https://media.tenor.com/oABoYJfl05kAAAAM/majonotakkyubin-kikisdelivery.gif',
          'https://media1.tenor.com/m/QeNq3_I5-owAAAAC/green-studio-ghibli.gif',
          'https://media1.tenor.com/m/YjCqkJ7kQRkAAAAC/my-neighbor-totoro.gif',
          'https://media.tenor.com/ax94CJ1L_IoAAAAM/cute.gif',
          'https://media.tenor.com/faPlGUjSrggAAAAM/totoro-chibi-totoro.gif',
        ],
        card_colors: [
          '#6b705c',
          '#a5a58d',
          '#b7b7a4',
          '#4d5d53',
          '#b7c9af',
          '#738678',
          '#6b705c',
        ],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview: 'https://media.tenor.com/ax94CJ1L_IoAAAAM/cute.gif',
    },
    {
      color: 'black',
      score: 4340,
      title: 'Purple by otulpp',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0f0f0f',
          'background-1': '#0c0c0c',
          'background-2': '#141414',
          borders: '#1e1e1e',
          links: '#f5f5f5',
          sidebar: '#0c0c0c',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.imgur.com/HSR9yIV.jpg',
          'https://i.imgur.com/y2q6zwV.jpg',
          'https://i.imgur.com/H2v1YWD.jpg',
          'https://i.imgur.com/D2mHuH2.jpg',
          'https://i.imgur.com/HgcgCrr.jpg',
          'https://i.imgur.com/wvkvzTb.jpg',
          'https://i.imgur.com/Q6KKKe1.jpg',
        ],
        card_colors: ['#6f34f9'],
        custom_font: {
          family: "'Roboto Mono'",
          link: 'Roboto+Mono:wght@400;700',
        },
      },
      preview: 'https://i.imgur.com/D2mHuH2.jpg',
    },
    {
      color: 'pink',
      score: 3440,
      title: 'Flowers by Claire',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fff0f0',
          'background-1': '#ffafbd',
          'background-2': '#ffafbd',
          borders: '#ffafbd',
          links: '#e56182',
          sidebar: '#ffafbd',
          'sidebar-text': '#fbeef2',
          'text-0': '#e56182',
          'text-1': '#e56183',
          'text-2': '#ffafbd',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/e6/9f/1d/e69f1dd00ade9de2ee056237b32cfd31.jpg',
          'https://i.pinimg.com/564x/b4/64/6e/b4646e96b2fad3a816bbc001e96974b1.jpg',
          'https://i.pinimg.com/564x/a3/60/36/a36036af9412b7271c371e8d5fa7b4ba.jpg',
          'https://i.pinimg.com/736x/7c/7a/c8/7c7ac8b643b750da71bb998bef593b58.jpg',
          'https://i.pinimg.com/564x/ce/c9/d1/cec9d1b3757b98894ab90182f15b7b33.jpg',
          'https://i.pinimg.com/736x/65/70/de/6570deac9ff58a9bde044cc62803a0e8.jpg',
          'https://i.pinimg.com/564x/5f/9f/9a/5f9f9aebee92c88d916137cafc717d4e.jpg',
        ],
        card_colors: ['#e56182'],
        custom_font: { family: "'Caveat'", link: 'Caveat:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/b4/64/6e/b4646e96b2fad3a816bbc001e96974b1.jpg',
    },
    {
      color: 'yellow',
      score: 4440,
      title: 'Snoopy by Lauren',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f5f1d6',
          'background-1': '#dda15e',
          'background-2': '#bc6c25',
          borders: '#283618',
          links: '#dda15e',
          sidebar: '#606c38',
          'sidebar-text': '#ffffff',
          'text-0': '#273517',
          'text-1': '#283618',
          'text-2': '#a5a5a5',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/04/f9/a5/04f9a5b70b4bd04b6045baf1f6dc0d47.jpg',
          'https://i.pinimg.com/564x/14/b9/87/14b987e0800e2f0b2a74cef4b4ad3742.jpg',
          'https://i.pinimg.com/564x/e3/a4/ab/e3a4aba2f25d953e9b476c9d4723eede.jpg',
          'https://i.pinimg.com/564x/c0/e9/74/c0e9743735a91884bb04e52a876760a4.jpg',
          'https://i.pinimg.com/564x/ac/4c/f2/ac4cf2e780df3a3759e787d315d53097.jpg',
        ],
        card_colors: ['#e3b505', '#95190c', '#610345', '#107e7d', '#044b7f'],
        custom_font: { family: "'Jost'", link: 'Jost:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/ac/4c/f2/ac4cf2e780df3a3759e787d315d53097.jpg',
    },
    {
      color: 'pink',
      score: 4440,
      title: 'PinkJapan by Claire',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fff0f5',
          'background-1': '#ffc7dd',
          'background-2': '#ffc7dd',
          borders: '#ffc7dd',
          links: '#ff80bd',
          sidebar:
            'linear-gradient(#ffc7ddc7, #ffc7ddc7), url("https://i.pinimg.com/474x/f9/1f/ce/f91fced51498b3456b80312fdd953ce1.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#ff80bd',
          'text-1': '#ff80bd',
          'text-2': '#ff80bd',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/92/d8/d4/92d8d4e9d0b61e5f9574c00976725a28.jpg',
          'https://i.pinimg.com/474x/c6/52/f0/c652f0253c8ec6c794add92329e21369.jpg',
          'https://i.pinimg.com/474x/d2/df/02/d2df02bd7a5946045814fd5700b323f1.jpg',
          'https://i.pinimg.com/474x/95/46/63/954663a3d108406009a26dab1142e520.jpg',
          'https://i.pinimg.com/474x/69/51/db/6951db7b8ba65c468b1d5cc1b8055546.jpg',
          'https://i.pinimg.com/474x/dd/51/b4/dd51b466f93d2bb733d42efb97476224.jpg',
          'https://i.pinimg.com/474x/8a/cc/11/8acc111b37b4d1cdfee89ab7e48ee548.jpg',
          'https://i.pinimg.com/474x/60/fb/47/60fb47640a25fca8d9f0db8ee7a538b4.jpg',
          'https://i.pinimg.com/474x/30/5d/a8/305da88a22614323a1c449c7692f6204.jpg',
          'https://i.pinimg.com/474x/44/8b/d0/448bd0957ec3b2da842312461e069fcc.jpg',
        ],
        card_colors: ['#ff80bd'],
        custom_font: { family: "'DM Sans'", link: 'DM+Sans:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/474x/95/46/63/954663a3d108406009a26dab1142e520.jpg',
    },
    {
      color: 'blue',
      score: 4440,
      title: 'Shark by Myles',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0a272e',
          'background-1': '#103842',
          'background-2': '#103842',
          borders: '#1a5766',
          links: '#3bb9d8',
          sidebar: '#103842',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/0b/9e/a3/0b9ea33d064d84a40ef294728c41f85b.jpg',
          'https://i.pinimg.com/736x/6b/ee/df/6beedf5c1258a1ab3c2b244bcb8cf9d1.jpg',
          'https://i.pinimg.com/474x/ef/06/eb/ef06eb139d8e8d1300e2a6f4a2e352af.jpg',
          'https://p16-va.lemon8cdn.com/tos-maliva-v-ac5634-us/oUoyiAz4EgBhAAG1N6BoIRAfDOR60jIyX062E2~tplv-tej9nj120t-origin.webp',
          'https://p16-va.lemon8cdn.com/tos-maliva-v-ac5634-us/oANyp42A6TziDRJhR2fy6EAXghAoIoBGOIAE6B~tplv-tej9nj120t-origin.webp',
        ],
        card_colors: ['#1770ab', '#74c69d', '#74c69d', '#74c69d', '#52b788'],
        custom_font: {
          family: "'Silkscreen'",
          link: 'Silkscreen:wght@400;700',
        },
      },
      preview:
        'https://p16-va.lemon8cdn.com/tos-maliva-v-ac5634-us/oANyp42A6TziDRJhR2fy6EAXghAoIoBGOIAE6B~tplv-tej9nj120t-origin.webp',
    },
    {
      color: 'purple',
      score: 4430,
      title: 'Kuromi by Melissa',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#391d3e',
          'background-1': '#a077a6',
          'background-2': '#a58fa8',
          borders: '#836487',
          links: '#e1bce6',
          sidebar:
            'linear-gradient(#352537c7, #352537c7), url("https://static.vecteezy.com/system/resources/thumbnails/018/939/219/small/pastel-purple-hearts-seamless-geometric-pattern-with-diagonal-circle-line-background-free-vector.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/90/df/66/90df6664fb0bf88a11fec12e34caf53d.gif',
          'https://i.pinimg.com/originals/bc/59/15/bc5915d9e2b7e43e6531cc6a81cbef4d.gif',
        ],
        card_colors: ['#e0aaff', '#177b63'],
        custom_font: {
          family: "'Silkscreen'",
          link: 'Silkscreen:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/originals/90/df/66/90df6664fb0bf88a11fec12e34caf53d.gif',
    },
    {
      color: 'yellow',
      score: 4440,
      title: 'pompompurin by Kendelyn',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f8fea9',
          'background-1': '#fed886',
          'background-2': '#ffe8b8',
          borders: '#ffd952',
          links: '#ca8612',
          sidebar: '#d2772d',
          'sidebar-text': '#ffda9e',
          'text-0': '#b46027',
          'text-1': '#a95c28',
          'text-2': '#c69b24',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/ea/18/10/ea1810fba54012ef67a945021dd035a6.jpg',
          'https://i.pinimg.com/564x/dd/9a/76/dd9a76d2faaeb9c6a8198ff9ecf1c309.jpg',
          'https://i.pinimg.com/564x/7f/1a/df/7f1adfb72d69972e2bfdae0e7dbcaa3f.jpg',
          'https://i.pinimg.com/736x/1b/14/67/1b1467e4466f6eb324854229b7e4ffe7.jpg',
          'https://i.pinimg.com/564x/09/91/29/09912908d31713bdd5c556ae5e5e9c90.jpg',
        ],
        card_colors: [
          '#f6bd60',
          '#f28482',
          '#f5cac3',
          '#84a59d',
          '#f7ede2',
          '#f6bd60',
          '#f28482',
          '#f5cac3',
          '#84a59d',
          '#f7ede2',
          '#f6bd60',
        ],
        custom_font: {
          family: "'Silkscreen'",
          link: 'Silkscreen:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/736x/ea/18/10/ea1810fba54012ef67a945021dd035a6.jpg',
    },
    {
      color: 'gray',
      score: 4340,
      title: 'Dark by Liz',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#131515',
          'background-1': '#1f2323',
          'background-2': '#1f2323',
          borders: '#2a3232',
          links: '#6c95a7',
          sidebar: '#1f2323',
          'sidebar-text': '#dedede',
          'text-0': '#c7c7c7',
          'text-1': '#b0b0b0',
          'text-2': '#9c9c9c',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/c2/09/bc/c209bc5e71df606082deae962cee0e78.jpg',
          'https://i.pinimg.com/236x/21/54/9f/21549f96b7173fe2c9dc6507dcd4c193.jpg',
          'https://i.pinimg.com/236x/5b/a2/c2/5ba2c203ce3c1968bdb80c3bbe568520.jpg',
          'https://i.pinimg.com/236x/da/ab/2c/daab2c18fc3910e3419f8dbc8b4d0acb.jpg',
          'https://i.pinimg.com/236x/6b/5c/90/6b5c90c34191a3a1ee9c7ca64d822389.jpg',
          'https://i.pinimg.com/236x/28/a8/fb/28a8fbcde35257c8117e31f502f0b64b.jpg',
        ],
        card_colors: [
          '#284057',
          '#3e589b',
          '#3f626f',
          '#2c4c58',
          '#2d3e3f',
          '#535c73',
        ],
        custom_font: {
          family: "'Merriweather'",
          link: 'Merriweather:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/236x/21/54/9f/21549f96b7173fe2c9dc6507dcd4c193.jpg',
    },
    {
      color: 'yellow',
      score: 4320,
      title: 'OnePiece by Allison',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fef6d7',
          'background-1': '#942222',
          'background-2': '#1a1a1a',
          borders: '#272727',
          links: '#942222',
          sidebar: '#feefb4',
          'sidebar-text': '#000000',
          'text-0': '#000000',
          'text-1': '#000000',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://preview.redd.it/goofy-frames-v0-gcoti56dlltb1.jpg?width=567&format=pjpg&auto=webp&s=3b44cbcc94cdcc360e07115dc17d1f9a23c7c2e1',
          'https://i.pinimg.com/236x/df/c0/74/dfc074b259975bc010100eb36439fe18.jpg',
          'https://preview.redd.it/if-zoro-got-lost-and-ended-up-in-the-back-rooms-do-you-v0-404t0gtyebcb1.png?auto=webp&s=f188b2b5be9e79886d78bab59e03f9eb3cb0a331',
          'https://4.bp.blogspot.com/-11EYfCo7EB4/TwNYx_cDKmI/AAAAAAAAJy4/5eZn-GElZkY/s1600/luffy%2Bpeace%2Bsign.jpeg',
        ],
        card_colors: ['#942222'],
        custom_font: { family: "'Caveat'", link: 'Caveat:wght@400;700' },
      },
      preview:
        'https://wallpapers.com/images/high/one-piece-anime-pirates-orange-sky-bxi22a7lzq54tn30.webp',
    },
    {
      color: 'green',
      score: 4440,
      title: 'Forest by Varun',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#102623',
          'background-1': '#102623',
          'background-2': '#102623',
          borders: '#3d714b',
          links: '#8fffad',
          sidebar: '#3d714b',
          'sidebar-text': '#ffffff',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#fff',
        },
        custom_cards: [
          'https://c4.wallpaperflare.com/wallpaper/443/482/424/studio-ghibli-forest-clearing-forest-landscape-oak-hd-wallpaper-thumb.jpg',
          'https://imagedelivery.net/9sCnq8t6WEGNay0RAQNdvQ/UUID-cl9cmhu9i0107qioxvdh37mw7/public',
          'https://i.pinimg.com/564x/a5/a6/f5/a5a6f5446e9366d6c40f0bef29fe1f1a.jpg',
          'https://imagedelivery.net/9sCnq8t6WEGNay0RAQNdvQ/UUID-cl9d7s5k51356r9os6m9w70yn/public',
          'https://pbs.twimg.com/media/EPjktX8U4AA__Cu?format=jpg&name=large',
        ],
        card_colors: ['#008400'],
        custom_font: {
          family: "'Nanum Myeongjo'",
          link: 'Nanum+Myeongjo:wght@400;700',
        },
      },
      preview:
        'https://c4.wallpaperflare.com/wallpaper/443/482/424/studio-ghibli-forest-clearing-forest-landscape-oak-hd-wallpaper-thumb.jpg',
    },
    {
      color: 'pink',
      score: 4440,
      title: 'PastelPink by Kai',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fae3ef',
          'background-1': '#f5a2cb',
          'background-2': '#f78bc1',
          borders: '#f78bc1',
          links: '#802a55',
          sidebar: '#db76a9',
          'sidebar-text': '#000000',
          'text-0': '#000000',
          'text-1': '#000000',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://m.media-amazon.com/images/I/61SDXeSVUXL._AC_UF894,1000_QL80_.jpg',
          'https://64.media.tumblr.com/d4a13a446aa5e5f289e20814e0a94235/tumblr_or32x0dlHD1wp29mto1_1280.jpg',
          'https://i.pinimg.com/originals/9f/77/6f/9f776fe088d31b850058c4bc5fcc52cc.jpg',
          'https://i.pinimg.com/564x/ee/6d/5c/ee6d5c9693406c3d90555efd9cd2fdb9.jpg',
          'https://t3.ftcdn.net/jpg/05/70/74/80/360_F_570748088_ggUWmbyHXAJwVuSgkXwUHaCldPFMLv32.jpg',
        ],
        card_colors: ['#db93aa', '#f7b2de', '#de87be', '#f29bbe', '#f7b2c8'],
        custom_font: { family: "'Poppins'", link: 'Poppins:wght@400;700' },
      },
      preview:
        'https://m.media-amazon.com/images/I/61SDXeSVUXL._AC_UF894,1000_QL80_.jpg',
    },
    {
      color: 'blue',
      score: 4441,
      title: 'CyberAngel by 97px',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0c1118',
          'background-1': '#1a2026',
          'background-2': '#212930',
          borders: '#485160',
          links: '#809cb7',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://i.pinimg.com/564x/df/88/4c/df884c2af6c9e7fcbc6c7809c12cc684.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/61/1c/32/611c32cd30d311b863d12910d416f2e2.jpg',
          'https://i.pinimg.com/564x/7e/8f/da/7e8fda50c06fe88b8b271769def00174.jpg',
          'https://i.pinimg.com/564x/10/2f/de/102fdea53f74f092d2e926afa23eb84f.jpg',
          'https://i.pinimg.com/564x/70/e9/b8/70e9b85b5fc08e6a468f44df78059b08.jpg',
          'https://i.pinimg.com/736x/5f/fd/ff/5ffdff40aedb7713493797e0a69fbdb1.jpg',
          'https://i.pinimg.com/736x/59/d2/89/59d289108917dc91e84d7db700b59fe4.jpg',
          'https://i.pinimg.com/564x/b8/a4/8d/b8a48d59dc88de13547660c233d46537.jpg',
          'https://i.pinimg.com/564x/30/bf/ff/30bfff53b927f7f763aeb3f6f0ff06ae.jpg',
          'https://i.pinimg.com/564x/2d/fa/ff/2dfaff23df05fe1da551cac4f6ab19e1.jpg',
        ],
        card_colors: [
          '#e7e6f7',
          '#e3d0d8',
          '#aea3b0',
          '#827081',
          '#c6d2ed',
          '#e7e6f7',
          '#e3d0d8',
          '#aea3b0',
          '#827081',
        ],
        custom_font: {
          family: "'Martian Mono'",
          link: 'Martian+Mono:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/736x/5f/fd/ff/5ffdff40aedb7713493797e0a69fbdb1.jpg',
    },
    {
      color: 'lightgreen',
      score: 4441,
      title: 'Cleangreen by Victoria',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#c2c5aa',
          'background-1': '#a4ac86',
          'background-2': '#a4ac86',
          borders: '#a4ac86',
          links: '#656d4a',
          sidebar: 'linear-gradient(#333d29, #a4ac86)',
          'sidebar-text': '#c2c5aa',
          'text-0': '#333d29',
          'text-1': '#333d29',
          'text-2': '#333d29',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/e3/d1/89/e3d189730e159acbd9b6a5e1f70a77b4.jpg',
          'https://i.pinimg.com/564x/ef/4f/56/ef4f56f6d701fbb0e865009343036623.jpg',
          'https://i.pinimg.com/474x/fa/62/1c/fa621c222352df35e79641ac909bfecb.jpg',
          'https://i.pinimg.com/564x/62/36/71/623671ce9709c260686c26be2e67bf07.jpg',
          'https://i.pinimg.com/564x/9c/d9/37/9cd937fe6bc552c5610486ffb65aedea.jpg',
          'https://i.pinimg.com/474x/8e/44/ed/8e44eddf85abfd0b12dc211ea27428db.jpg',
          'https://i.pinimg.com/564x/42/ed/32/42ed32e2a701c13485fb37718083a15f.jpg',
        ],
        card_colors: ['#333d29'],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/474x/e3/d1/89/e3d189730e159acbd9b6a5e1f70a77b4.jpg',
    },
    {
      color: 'green',
      score: 4440,
      title: 'AdvTime by Myles',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#91c5b4',
          'background-1': '#d8ad5c',
          'background-2': '#4b7b80',
          borders: '#d8ad5c',
          links: '#c5624c',
          sidebar: '#d8ad5c',
          'sidebar-text': '#ffffff',
          'text-0': '#1d2c3a',
          'text-1': '#1d2c3a',
          'text-2': '#1d2c3a',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/fd/55/9b/fd559ba05f7a8d5c07e198705c5385ea.gif',
          'https://media1.giphy.com/media/pO4UHglOY2vII/giphy.gif',
          'https://i.pinimg.com/originals/37/2d/fb/372dfb2003333955e666adf880a7ba44.gif',
          'https://i.pinimg.com/originals/b8/a5/d6/b8a5d6ff341676bdb249192a90ff012d.gif',
          'https://i.pinimg.com/originals/3c/35/6a/3c356aa3fa44e42edca87bb6f99c8102.gif',
        ],
        card_colors: ['#4b7b80'],
        custom_font: {
          family: "'Silkscreen'",
          link: 'Silkscreen:wght@400;700',
        },
      },
      preview: 'https://media1.giphy.com/media/pO4UHglOY2vII/giphy.gif',
    },
    {
      color: 'gray',
      score: 3340,
      title: 'Waveform by Evan',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#212838',
          'background-1': '#1a2026',
          'background-2': '#212930',
          borders: '#2e3943',
          links: '#56Caf0',
          sidebar: '#1a2026',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://64.media.tumblr.com/8b8355866f27dcfc2cf61c4635b97403/tumblr_p0dhkklO2K1txe8seo1_500.gif',
          'https://i.imgur.com/HEMgWMm.gif',
          'https://i.pinimg.com/originals/6a/a2/91/6aa291a29c9ff0674e0777f86e6f4bf8.gif',
          'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcXB2aHR4aXU1YTU1YnY1NHplcHgwOHBycHZndnpqbnUxZXlrbzhxciZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/1YiJ9qOYgWPCQKhRjj/giphy.gif',
          'https://i.pinimg.com/originals/46/03/97/460397c66c7e383f03a0f06cbb9060bd.gif',
          'https://64.media.tumblr.com/f53c69d759bc119edda51e3eb4e6074b/tumblr_oxa6a3Faj31txe8seo1_500.gif',
        ],
        card_colors: [
          '#e0aaff',
          '#ffcce9',
          '#da70d6',
          '#fc9c54',
          '#65499d',
          '#f25b43',
          '#e0aaff',
          '#ffe373',
        ],
        custom_font: {
          family: "'Montserrat'",
          link: 'Montserrat:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/originals/46/03/97/460397c66c7e383f03a0f06cbb9060bd.gif',
    },
    {
      color: 'purple',
      score: 2230,
      title: 'ErasTour by Brady',
      exports: {
        dark_mode: true,
        dark_preset: {
          'background-0': '#151c37',
          'background-1': '#303554',
          'background-2': '#303554',
          borders: '#494e74',
          links: '#eeb4df',
          sidebar: '#303554',
          'sidebar-text': '#ffffff',
          'text-0': '#ffffff',
          'text-1': '#ededed',
          'text-2': '#a5a5a5',
        },
        custom_cards: [
          'https://images.foxtv.com/static.fox5dc.com/www.fox5dc.com/content/uploads/2023/08/932/524/GettyImages-1604744167.jpg?ve=1&tl=1',
          'https://media1.popsugar-assets.com/files/thumbor/ygMeK-Rm0QEm86LW6Fd3CIBSciU=/fit-in/6000x4000/top/filters:format_auto():extract_cover():upscale()/2023/04/11/843/n/1922283/63fa5bca89225ec5_GettyImages-1474304446.jpg',
          'https://imageio.forbes.com/specials-images/imageserve/64823ba3758d2d944c2a569a/Taylor-Swift--The-Eras-Tour-/960x0.jpg?format=jpg&width=960',
          'https://media.cnn.com/api/v1/images/stellar/prod/230318120226-03-taylor-swift-eras-tour-0317.jpg?c=original',
          'https://pbs.twimg.com/media/F0fOjZzacAYEr08.jpg:large',
          'https://image.cnbcfm.com/api/v1/image/107278487-1690547920875-gettyimages-1564524396-haywardphoto261856_trsqwu49_jyefddip.jpeg?v=1696873880',
          'https://graziamagazine.com/es/wp-content/uploads/sites/12/2023/09/Foggatt-Taylor-Swift-Eras-copia.jpg',
          'https://i.abcnewsfe.com/a/93b560e6-45df-4a00-9d6a-f0f3a0165f72/taylor-swift-brazil-gty-jt-231118_1700327206575_hpMain.jpg',
          'https://images.foxtv.com/static.fox5dc.com/www.fox5dc.com/content/uploads/2023/08/932/524/GettyImages-1604744167.jpg?ve=1&tl=1',
          'https://media1.popsugar-assets.com/files/thumbor/ygMeK-Rm0QEm86LW6Fd3CIBSciU=/fit-in/6000x4000/top/filters:format_auto():extract_cover():upscale()/2023/04/11/843/n/1922283/63fa5bca89225ec5_GettyImages-1474304446.jpg',
          'https://imageio.forbes.com/specials-images/imageserve/64823ba3758d2d944c2a569a/Taylor-Swift--The-Eras-Tour-/960x0.jpg?format=jpg&width=960',
          'https://media.cnn.com/api/v1/images/stellar/prod/230318120226-03-taylor-swift-eras-tour-0317.jpg?c=original',
          'https://pbs.twimg.com/media/F0fOjZzacAYEr08.jpg:large',
        ],
        card_colors: ['#eeb4df'],
        custom_font: { family: "'DM Sans'", link: 'DM+Sans:wght@400;700' },
      },
      preview:
        'https://images.foxtv.com/static.fox5dc.com/www.fox5dc.com/content/uploads/2023/08/932/524/GettyImages-1604744167.jpg?ve=1&tl=1',
    },
    {
      color: 'purple',
      score: 3340,
      title: 'Royalty by Kat',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#adb7db',
          'background-1': '#838caf',
          'background-2': '#838caf',
          borders: '#080821',
          links: '#121131',
          sidebar: '#838caf',
          'sidebar-text': '#080821',
          'text-0': '#080821',
          'text-1': '#080821',
          'text-2': '#242461',
        },
        custom_cards: [
          'https://images.unsplash.com/photo-1585231474241-c8340c2b2c65?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
          'https://images.unsplash.com/photo-1580677616212-2fa929e9c2cd?w=600&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1577493327436-6b54af0aabb3?w=600&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1571301092535-61a418b457dd?w=600&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1598902596597-728cb15eeb3f?w=600&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1437751068958-82e6fccc9360?w=600&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1543143519-b2ee4b77524e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
          'https://images.unsplash.com/photo-1571224602141-9428962fc095?w=600&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1491156855053-9cdff72c7f85?w=600&auto=format&fit=crop&q=60',
          'https://images.unsplash.com/photo-1531762948975-73032b7b61f4?w=600&auto=format&fit=crop&q=60',
        ],
        card_colors: ['#e56b6f', '#b56576', '#6d597a', '#355070'],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://images.unsplash.com/photo-1571301092535-61a418b457dd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3',
    },
    {
      color: 'purple',
      score: 4430,
      title: 'Lilac by Jacee',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#adb7db',
          'background-1': '#838caf',
          'background-2': '#838caf',
          borders: '#080821',
          links: '#121131',
          sidebar: '#838caf',
          'sidebar-text': '#080821',
          'text-0': '#080821',
          'text-1': '#080821',
          'text-2': '#242461',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/17/92/c1/1792c16af2c210cce4280d03e8a97396.jpg',
          'https://i.pinimg.com/474x/1c/af/9b/1caf9bd8c7b683ecd684a866e8227baf.jpg',
          'https://i.etsystatic.com/21095131/r/il/0e4ddd/3584401402/il_fullxfull.3584401402_f867.jpg',
          'https://64.media.tumblr.com/d180947a80af3fd0e25453c89cb8d222/tumblr_pqdi8vwbkQ1si78dx_1280.jpg',
          'https://wallpapers.com/images/hd/periwinkle-aesthetic-dandelion-field-qtcn9i6giu0yn3a3.jpg',
          'https://i.pinimg.com/474x/8a/76/5a/8a765ae11cfb0749f9c0e0a9fab35582.jpg',
          'https://i.pinimg.com/474x/fb/c1/98/fbc198da9827fc89a189a55cf0c0ce64.jpg',
        ],
        card_colors: ['#080821'],
        custom_font: { family: "'Comfortaa'", link: 'Comfortaa:wght@400;700' },
      },
      preview:
        'https://wallpapers.com/images/hd/periwinkle-aesthetic-dandelion-field-qtcn9i6giu0yn3a3.jpg',
    },
    {
      color: 'green',
      score: 4330,
      title: 'Forest by Virginia',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#042f0e',
          'background-1': '#6f5c38',
          'background-2': '#8bf79d',
          borders: '#a08a5a',
          links: '#cecc88',
          sidebar: 'linear-gradient(#a08a5a, #251504)',
          'sidebar-text': '#000000',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://media4.giphy.com/media/l0Exh0jvgGY43qKPe/200w.webp?rid=200w.webp&ct=g',
          'https://media3.giphy.com/media/xUA7b4arnbo3THfzi0/200w.webp?rid=200w.webp&ct=g',
          'https://media0.giphy.com/media/XAe9aDBIv3arS/giphy.webp?rid=giphy.webp&ct=g',
          'https://media1.giphy.com/media/Qgfz2N36MgUBG/200.webp?rid=200.webp&ct=g',
          'https://media0.giphy.com/media/uf3jumi0zzUv6/200.webp?rid=200.webp&ct=g',
          'https://media4.giphy.com/media/xT0xeMhvHEAm72SXBe/200w.webp?rid=200w.webp&ct=g',
          'https://media4.giphy.com/media/Fyh2GnAMYtK3HTlklo/200w.webp?rid=200w.webp&ct=g',
          'https://media0.giphy.com/media/xUA7b1AZjL2fQNUp8s/giphy.gif?rid=giphy.gif&ct=g',
          'https://media3.giphy.com/media/l0Ex3SyTrdOTUgPte/giphy.gif?rid=giphy.gif&ct=g',
        ],
        card_colors: ['#a08a5a'],
        custom_font: {
          family: "'Happy Monkey'",
          link: 'Happy+Monkey:wght@400;700',
        },
      },
      preview:
        'https://media4.giphy.com/media/l0Exh0jvgGY43qKPe/200w.webp?rid=200w.webp&ct=g',
    },
    {
      color: 'black',
      score: 4410,
      title: 'Blood Prime by Aidan',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#000000',
          borders: '#ff0000',
          links: '#ff0000',
          sidebar: '#000000',
          'sidebar-text': '#ff0000',
          'text-0': '#ff0000',
          'text-1': '#ff0000',
          'text-2': '#ff0000',
        },
        custom_cards: [
          'https://i.ytimg.com/vi/EGYI_9FSi4s/maxresdefault.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSaluUymvRIt5MTnyMPf4dfporZZk5eaFZ7jqIWAOKIldDW-zfpz3R1RvxZ8FG-16fEmNU5577f03d6369372c6a411812eedf61f8.jpg',
          'https://i.ytimg.com/vi/6U5aKJmLRRI/hqdefault.jpg?sqp=-oaymwEmCOADEOgC8quKqQMa8AEB-AH-BIAC6AKKAgwIABABGGUgYChLMA8=&rs=AOn4CLAKcBM8SNhfV6fXE7Oe4gszKbIEVw',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFDoNqI-wUofVjmp1NyZh88aZIaAQ4phaYQ0jrMCsjcQ&s',
          'https://i.ytimg.com/vi/atSD-bXGBFo/hqdefault.jpg',
          'https://i.ytimg.com/vi/r95mGoVVreU/maxresdefault.jpg',
        ],
        card_colors: ['#ff0000'],
        custom_font: { family: "'Tektur'", link: 'Tektur:wght@400;700' },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFDoNqI-wUofVjmp1NyZh88aZIaAQ4phaYQ0jrMCsjcQ&s',
    },
    {
      color: 'purple',
      score: 4440,
      title: 'SapphicDreams by Elaine',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#3c2a38',
          'background-1': '#856693',
          'background-2': '#8a6a8a',
          borders: '#81657b',
          links: '#dba4be',
          sidebar: '#856693',
          'sidebar-text': '#f5f5f5',
          'text-0': '#ddb6db',
          'text-1': '#c78faf',
          'text-2': '#392232',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/92/5f/3c/925f3ca41b2046070dd3d2bc8cfad2bb.jpg',
          'https://i.pinimg.com/564x/f0/52/05/f0520533892e52e8418ee387132da77c.jpg',
          'https://i.pinimg.com/564x/f7/1d/ef/f71defa1317a1900c33e8a367f7f9c46.jpg',
          'https://i.pinimg.com/564x/40/99/1b/40991b2b1a00766b1e7d2ac705f4c8e8.jpg',
          'https://i.pinimg.com/564x/f5/1f/bf/f51fbf4a5498be82bc8ec5c931a38135.jpg',
          'https://i.pinimg.com/474x/18/d8/a5/18d8a56d4074762c356f2dd6de3744ec.jpg',
          'https://i.pinimg.com/564x/33/ad/c0/33adc0aa7de72a8d01961b787f42c507.jpg',
        ],
        card_colors: ['#856693'],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/f5/1f/bf/f51fbf4a5498be82bc8ec5c931a38135.jpg',
    },
    {
      color: 'gray',
      score: 1230,
      title: 'OnePiece by Alex',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#131b25',
          'background-1': '#1a2026',
          'background-2': '#212930',
          borders: '#2e3943',
          links: '#b9c1ca',
          sidebar: '#1d273a',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/fd/b6/13/fdb6130db7338af852fd17fa854aeed7.jpg',
          'https://simkl.net/episodes/45/4587110ce85cea735_0.jpg',
          'https://ricedigital.co.uk/wp-content/uploads/2022/05/1-7-1024x576.jpg',
          'https://i.pinimg.com/originals/19/74/9f/19749f58b53fbf0ac9eb91166d418341.jpg',
          'https://media.tenor.com/KNSYmkSCgGQAAAAe/one-piece-monkey-d-luffy.png',
          'https://i.pinimg.com/originals/ba/f1/cc/baf1cc280bc69b16b8171ac594171805.jpg',
        ],
        card_colors: [
          '#c44963',
          '#f1d265',
          '#2367b4',
          '#7ae4a2',
          '#cd2d36',
          '#fa8d30',
        ],
        custom_font: { family: "'Comfortaa'", link: 'Comfortaa:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/736x/fd/b6/13/fdb6130db7338af852fd17fa854aeed7.jpg',
    },
    {
      color: 'red',
      score: 3420,
      title: 'DarkSide by Whitney',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#922020',
          'background-1': '#922020',
          'background-2': '#000000',
          borders: '#000000',
          links: '#000000',
          sidebar: '#000000',
          'sidebar-text': '#922020',
          'text-0': '#000000',
          'text-1': '#000000',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://media0.giphy.com/media/1HPUSulSOHDpe/200w.webp?cid=ecf05e478c5mdsl8uhcr9yj35p01vmuk5m4rflibey76ke14&ep=v1_gifs_search&rid=200w.webp&ct=g',
          'https://media2.giphy.com/media/voKRB2g96S8q4/giphy.webp?cid=ecf05e478c5mdsl8uhcr9yj35p01vmuk5m4rflibey76ke14&ep=v1_gifs_search&rid=giphy.webp&ct=g',
          'https://media4.giphy.com/media/mZAL1GTRA8VnkRaU47/200w.webp?cid=ecf05e47frhquzpazkdzjkapdyionh70512xx37fddji4736&ep=v1_gifs_search&rid=200w.webp&ct=g',
          'https://media1.giphy.com/media/1FZqAOn4hzGO4/giphy.webp?cid=ecf05e478c5mdsl8uhcr9yj35p01vmuk5m4rflibey76ke14&ep=v1_gifs_search&rid=giphy.webp&ct=g',
          'https://media4.giphy.com/media/GIIC4jmmUlXZS/100.webp?cid=ecf05e478c5mdsl8uhcr9yj35p01vmuk5m4rflibey76ke14&ep=v1_gifs_search&rid=100.webp&ct=g',
        ],
        card_colors: ['#000000'],
        custom_font: { family: "'Orbitron'", link: 'Orbitron:wght@400;700' },
      },
      preview:
        'https://media4.giphy.com/media/mZAL1GTRA8VnkRaU47/200w.webp?cid=ecf05e47frhquzpazkdzjkapdyionh70512xx37fddji4736&ep=v1_gifs_search&rid=200w.webp&ct=g',
    },
    {
      color: 'pink',
      score: 4430,
      title: 'Melody by Dean',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffebf2',
          'background-1': '#fcbce8',
          'background-2': '#ae808c',
          borders: '#fca3d8',
          links: '#cc85af',
          sidebar:
            'linear-gradient(#e1e0e0c7, #c89797c7), center url("https://th.bing.com/th/id/OIP.L79DXEf-CLSDrCpUMAvGRwHaLH?rs=1&pid=ImgDetMain")',
          'sidebar-text': '#ffffff',
          'text-0': '#a77287',
          'text-1': '#fb88c8',
          'text-2': '#cc619f',
        },
        custom_cards: [
          'https://media1.tenor.com/m/1buQJI4o9vAAAAAd/cute-pink.gif',
          'https://media1.tenor.com/m/khnJakVn5TEAAAAd/melody-my-melody.gif   ',
          'https://media1.tenor.com/m/WSqyJfV0_nwAAAAC/my-melody.gif',
          'https://media1.tenor.com/m/vYjxeV2WjFAAAAAC/my-melody-step-on.gif',
          'https://media1.tenor.com/m/VKFKDiweiyAAAAAC/my-melody-piano.gif',
          'https://media1.tenor.com/m/YYhMbnpGJ_4AAAAC/my-melody-melody-mark.gif',
          'https://media1.tenor.com/m/z78WKgKo75sAAAAC/my-melody.gif',
        ],
        card_colors: ['#db93aa', '#f7b2de', '#de87be', '#f29bbe', '#f7b2c8'],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/df/f5/91/dff591e2609bfb340bc55e99fd2f3465.jpg',
    },
    {
      color: 'yellow',
      score: 4330,
      title: 'Sisyphus by spampotato',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#EFDFC9',
          'background-1': '#1a2026',
          'background-2': '#212930',
          borders: '#2e3943',
          sidebar: '#152A19',
          'text-0': '#C57725',
          'text-1': '#D3995B',
          'text-2': '#210F04',
          links: '#C57880',
          'sidebar-text': '#f5f5f5',
        },
        custom_cards: [
          'https://media.tenor.com/8RV39jK3VxMAAAAM/sisyphus-cat.gif',
          'https://assets-global.website-files.com/607950a39edbce2cf6c08d42/6192443166cde78cda5c5b57_Untitled.png',
          'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSOMz8spYa8H9kEfHScJt5WYjG-ANdYV089MvFfWEqz0-rzVmgO',
          'https://media.tenor.com/8RV39jK3VxMAAAAM/sisyphus-cat.gif',
          'https://www.davelabowitz.com/wp-content/uploads/Sisyphus-e1557869810488.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8W7HmRbHVozDxpt5JPIBAKBlyRQkIgrCffg',
        ],
        card_colors: ['#1e453e', '#306844', '#455b55', '#182c25', '#2c4c3b'],
        custom_font: { link: 'Jost:wght@400;700', family: "'Jost'" },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ8W7HmRbHVozDxpt5JPIBAKBlyRQkIgrCffg',
    },
    {
      color: 'black',
      score: 3240,
      title: 'Trees by Aleena',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#353535',
          'background-2': '#404040',
          borders: '#454545',
          links: '#1a6b27',
          sidebar: '#353535',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://images.fineartamerica.com/images-medium-large-5/spring-green-trees-with-reflections-sharon-freeman.jpg',
          'https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/orange-grove-of-citrus-fruit-trees-jane-small.jpg',
          'https://images.saatchiart.com/saatchi/1012151/art/8622866/7686548-HSC00001-7.jpg',
          'https://i.etsystatic.com/22883174/r/il/a8ca5d/2844715041/il_570xN.2844715041_1dz2.jpg',
          'https://img.freepik.com/premium-photo/painting-purple-tree-with-wisteria-flowers_899870-12590.jpg',
          'https://images.saatchiart.com/saatchi/967155/art/4703159/3772991-HSC00001-7.jpg',
          'https://images.fineartamerica.com/images-medium-large-5/spring-green-trees-with-reflections-sharon-freeman.jpg',
          'https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/orange-grove-of-citrus-fruit-trees-jane-small.jpg',
        ],
        card_colors: [
          '#d92114',
          '#3c4f36',
          '#9c5800',
          '#9c5800',
          '#ad4769',
          '#65499d',
        ],
        custom_font: { family: "'Jost'", link: 'Jost:wght@400;700' },
      },
      preview:
        'https://img.freepik.com/premium-photo/painting-purple-tree-with-wisteria-flowers_899870-12590.jpg',
    },
    {
      color: 'gray',
      score: 3220,
      title: 'Beatsaber by Caleb',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#212838',
          'background-1': '#212930',
          'background-2': '#212930',
          borders: '#333e48',
          links: '#ff0000',
          sidebar: '#212838',
          'sidebar-text': '#e2e2e2',
          'text-0': '#e2e2e2',
          'text-1': '#e2e2e2',
          'text-2': '#e2e2e2',
        },
        custom_cards: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvBf_2yGsnPK9hBz2sbhSJG7MQ3rmRfNMb9Nr1DSYMHg&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2gQESdL2EUEHFZP4LnA0ZVPIQq5abpF-mJlmBn3avpg&s',
          'https://wallpapercave.com/wp/wp4370402.jpg',
        ],
        card_colors: ['#4554a4', '#ff2717', '#7d69dd'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS2gQESdL2EUEHFZP4LnA0ZVPIQq5abpF-mJlmBn3avpg&s',
    },
    {
      color: 'gray',
      score: 4440,
      title: 'Greek by Kaleigh',
      exports: {
        dark_mode: true,
        dark_preset: {
          'background-0': '#4a4a4a',
          'background-1': '#4a4a4a',
          'background-2': '#d4d4d4',
          borders: '#c7cdd1',
          links: '#b28148',
          sidebar:
            'linear-gradient(#ffffffc7, #ffffbfc7), center url("https://i.pinimg.com/474x/0c/83/07/0c8307a476975dca3432d17d5788f964.jpg")',
          'sidebar-text': '#4a4a4a',
          'text-0': '#b2acae',
          'text-1': '#efe1c7',
          'text-2': '#a5a5a5',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/d7/96/79/d79679e4c80b3875948d569852a151ee.jpg',
          'https://i.pinimg.com/474x/17/ec/41/17ec41a5247c8a88eec3a5a12c46ae66.jpg',
          'https://i.pinimg.com/474x/05/4d/fd/054dfddd0c440b876db9a806320f3086.jpg',
          'https://i.pinimg.com/474x/e0/09/69/e009699605e96c0acd5ecea759caf789.jpg',
          'https://i.pinimg.com/474x/a3/35/ef/a335ef4a1ce119244ed693ccdf9d70e1.jpg',
          'https://i.pinimg.com/474x/67/52/21/675221b14a679cdd7c87d030dce63f11.jpg',
          'https://i.pinimg.com/474x/9e/e1/40/9ee1404c3b71ecf1d22e418c361a53ce.jpg',
          'https://i.pinimg.com/474x/2f/74/2b/2f742b2ef6fa24666436179d2e992de0.jpg',
          'https://i.pinimg.com/474x/45/0c/80/450c803573477118245135ce6395f6a0.jpg',
          'https://i.pinimg.com/474x/7d/14/d1/7d14d187926bdb4aa8d5347b331aec41.jpg',
          'https://i.pinimg.com/474x/2d/62/59/2d625954d03fe6ea663bbdd700d14082.jpg',
        ],
        card_colors: ['#b2acae'],
        custom_font: {
          family: "'Nanum Myeongjo'",
          link: 'Nanum+Myeongjo:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/474x/d7/96/79/d79679e4c80b3875948d569852a151ee.jpg',
    },
    {
      color: 'gray',
      score: 2230,
      title: 'VintageAnime by Santiago',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#1f1e1e',
          'background-1': '#4d2c63',
          'background-2': '#285b8a',
          borders: '#a36124',
          links: '#f5f5f5',
          sidebar:
            'linear-gradient(#000000c7, #3f213bc7), center url("https://i.pinimg.com/originals/5c/40/be/5c40be22b66800c8b821b9e9caa2dc90.gif")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#9370a4',
          'text-2': '#6a22a5',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/de/17/ca/de17ca3f1e135eff83325f84868c1fba.gif',
          'https://media1.tenor.com/m/lxUZJpE7uXMAAAAC/city-lights-night-life.gif',
          'https://i.pinimg.com/originals/89/25/5a/89255a62a84dc4099b99bedfa8ea46fb.gif',
          'https://64.media.tumblr.com/53b924a6f8479c28945b597d777ea77f/tumblr_pa8dyabRjL1taibz9o1_500.gif',
          'https://64.media.tumblr.com/4c186daa9e6ea15e87130d87cf6ccdf7/tumblr_owumziZURe1re6nxeo2_r1_500.gif',
          'https://i.pinimg.com/originals/e1/f0/40/e1f04019b178b5a933bcd95802909a2b.gif',
          'https://i.imgur.com/GQtGOd9.gif',
          'https://media.tenor.com/9vi4zj-RddEAAAAC/aesthetic-anime.gif',
          'https://media.tenor.com/rp0Ixyk3J3gAAAAC/1980s-80s.gif',
          'https://vignette.wikia.nocookie.net/f2b942c1-4e68-488f-a1c6-a26cc57756a1/scale-to-width-down/1200',
        ],
        card_colors: ['#6f34f9'],
        custom_font: { family: "'Quicksand'", link: 'Quicksand:wght@400;700' },
      },
      preview: 'https://i.imgur.com/GQtGOd9.gif',
    },
    {
      color: 'green',
      score: 4440,
      title: 'Plants by Michael',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#001b00',
          'background-1': '#002b00',
          'background-2': '#389466',
          borders: '#84a98c',
          links: '#3aa207',
          sidebar: '#002b00',
          'sidebar-text': '#3ded97',
          'text-0': '#99edc3',
          'text-1': '#b3e694',
          'text-2': '#afcd98',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/54/f9/60/54f960e94a69cdab692f317ee42102f8.jpg',
          'https://i.pinimg.com/564x/e5/8d/1c/e58d1cd408adf298f335a737b916defe.jpg',
          'https://i.pinimg.com/564x/47/fa/4e/47fa4eedd6f954d47fd64fb4e9fe2cad.jpg',
          'https://i.pinimg.com/564x/f7/22/50/f722502a91b0c32ee2630ef7925d73cc.jpg',
        ],
        card_colors: ['#29a250', '#1f8c3d', '#167629', '#0c6016'],
        custom_font: {
          family: "'Nanum Myeongjo'",
          link: 'Nanum+Myeongjo:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/47/fa/4e/47fa4eedd6f954d47fd64fb4e9fe2cad.jpg',
    },
    {
      color: 'blue',
      score: 1230,
      title: 'Motivational by Kartavya',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#175a92',
          'background-1': '#f49030',
          'background-2': '#093C54',
          borders: '#d2c4ae',
          links: '#f49030',
          sidebar: 'linear-gradient(#00237c, #165117)',
          'sidebar-text': '#d2d2d2',
          'text-0': '#f0d6bb',
          'text-1': '#f0d6bb',
          'text-2': '#d2c4ae',
        },
        custom_cards: [
          'https://64.media.tumblr.com/33b0165bfb7563b2fde0cd1691a99bee/tumblr_oruiqnVcq51wpyv3go1_1280.gif',
          'https://i.pinimg.com/originals/09/7b/ec/097becdc539b05e12ad93ba4012e5887.gif',
          'https://media1.tenor.com/m/5RAZQqo3MokAAAAC/ego-kinpachi-blue-lock.gif',
          'https://i.pinimg.com/originals/1a/84/d9/1a84d9433d4e38aca666b44531623d0d.gif',
          'https://media0.giphy.com/media/3o7bugwhhJE9WhxkYw/giphy.gif',
          'https://i.pinimg.com/originals/20/30/05/203005c4ae0b199ecc8469697716c40e.gif',
          'https://i.pinimg.com/originals/d8/6b/54/d86b54b83cea8c149c98de9a2ef87f0b.gif',
          'https://media.tenor.com/Rn-_5B4Xx04AAAAM/eren-transform-eren-yeager.gif',
          'https://64.media.tumblr.com/5dfd496c9d65bf690ed716fb69508dba/cff7ad98d8acae21-5e/s540x810/c2816132a689ade70654565f6e31e8ad61d29d92.gif',
          'https://media.tenor.com/hJs4nS3iSxwAAAAM/hinata-shouyou-hinata.gif',
          'https://media1.tenor.com/m/2WKT3Xfp_BEAAAAd/blue-lock-anime.gif',
          'https://64.media.tumblr.com/a9799122b21df4918af75ef8584d34b5/5b9f3ef081a78430-f2/s540x810/aec2e712f2a54a6b395ba9862243e7eb1ce185f0.gifv',
        ],
        card_colors: ['#59a5ac'],
        custom_font: {
          family: "'Poiret One'",
          link: 'Poiret+One:wght@400;700',
        },
      },
      preview:
        'https://media.tenor.com/Rn-_5B4Xx04AAAAM/eren-transform-eren-yeager.gif',
    },
    {
      color: 'gray',
      score: 4440,
      title: 'Shady by Kayla',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#272727',
          'background-1': '#353535',
          'background-2': '#404040',
          borders: '#454545',
          links: '#d2d2d2',
          sidebar: '#353535',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdXVsanIyZ3BvNTh6ZXRnNzkzYzE4djV3Y245YmRvenoyYzJvdWFkdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/13BybT4Y2ZgRcQ/giphy.gif',
          'https://media.giphy.com/media/1wqpBuDDQegJk5R4IJ/giphy.gif',
          'https://i.pinimg.com/564x/0a/6f/86/0a6f863e0b175f28a289a42cf849304c.jpg',
          'https://i.pinimg.com/564x/8d/e6/cf/8de6cfcfb79ccb412c96592a3c6f7ca8.jpg',
          'https://i.pinimg.com/564x/9b/dd/72/9bdd72e985182c5d659edfd3a049d926.jpg',
          'https://i.pinimg.com/564x/5b/a9/34/5ba934e5e0f5179dd339595c59ca350d.jpg',
          'https://i.pinimg.com/564x/f3/a4/5a/f3a45a552201540be1e6cad239a23b81.jpg',
          'https://i.pinimg.com/736x/95/f4/8c/95f48c3ac654b2a7e752ed29e578034b.jpg',
          'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWVianZwc3JxbGNha3B3Mzd5MGc0c2JiY2J0Ymhmem9pZDFxZ25lcyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/fteNbiLizxry0AwgMR/giphy.gif',
          'https://media.giphy.com/media/RW2h8vSa20JCU/giphy.gif',
          'https://i.pinimg.com/564x/a0/74/5f/a0745f7a9f41a39956280033b30e7e1e.jpg',
          'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExamxnM2djYjd3MDZzcmJzN3pzMjhhZ215MXFxM202MWg4M2xybmFjYiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/2UJo0BzLw3W9MEchTF/giphy.gif',
          'https://i.pinimg.com/564x/41/41/e7/4141e7569a9acc3ffeb54d20beba97da.jpg',
          'https://i.pinimg.com/564x/44/05/90/44059060f115d09f50d6b4c074784888.jpg',
        ],
        card_colors: [
          '#b8b8b8',
          '#d4d4d4',
          '#9c9c9c',
          '#d4d4d4',
          '#d4d4d4',
          '#9c9c9c',
          '#b8b8b8',
          '#b8b8b8',
          '#b8b8b8',
          '#7f7f7f',
          '#9c9c9c',
          '#9c9c9c',
          '#b8b8b8',
          '#7f7f7f',
        ],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/0a/6f/86/0a6f863e0b175f28a289a42cf849304c.jpg',
    },
    {
      color: 'black',
      score: 2330,
      title: 'Straykids by Colleen',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#000000',
          borders: '#000000',
          links: '#ffffff',
          sidebar: '#000000',
          'sidebar-text': '#ffffff',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://64.media.tumblr.com/b8e45978086b1b5863b7861d926e0943/ec8e507813ae7ba2-6c/s540x810/1822e2a791e19991060f56d7769f0454c7ab34f1.gif',
          'https://i.pinimg.com/originals/15/20/2b/15202b4f2e91f2f68bda2563fec0e361.gif',
          'https://pa1.aminoapps.com/7296/2fc98dea32de4135ee231961ea3ce8ed89472877r1-540-240_hq.gif',
          'https://64.media.tumblr.com/ddb0c918146af823b2cd3d7be74ce787/c22c01c4b4bcb64c-3e/s540x810/85eac2d9916cd1adf00cd39b10c380c694b6188b.gifv',
        ],
        card_colors: ['#f6bd60', '#f28482', '#f5cac3', '#84a59d'],
        custom_font: { family: "'Poppins'", link: 'Poppins:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/9a/77/ef/9a77ef6d46ea8cb559381c66bf54f121.jpg',
    },
    {
      color: 'red',
      score: 4420,
      title: 'Journey by egg',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#360e02',
          'background-1': '#832525',
          'background-2': '#f6b731',
          borders: '#febd4d',
          links: '#ede9e9',
          sidebar: 'linear-gradient(#820808, #420000)',
          'sidebar-text': '#d37a31',
          'text-0': '#fec834',
          'text-1': '#ecc741',
          'text-2': '#dfb400',
        },
        custom_cards: [
          'https://i.imgur.com/13WmOcc.gif',
          'https://i.imgur.com/btFSNMs.gif',
          'https://64.media.tumblr.com/c02aa41729dc59fe2e88b53011778ba2/6f0dec9a6f459b6c-11/s640x960/176b088f471571f4018934baf919610aede51a99.gifv',
          'https://78.media.tumblr.com/69e4c37bdab0197f17eefb559e0fa455/tumblr_pacs7o9E5B1qcy62fo3_r1_500.gif',
          'https://www.kissmygeek.com/wp-content/uploads/2018/05/journey.gif',
          'https://i.pinimg.com/originals/4b/bd/8a/4bbd8a83074e8c5ca6cb0c389bf4b1fa.gif',
          'https://64.media.tumblr.com/8a797054ecfe065bccce5330f4dfe9b6/d79bf7349919150b-44/s640x960/2beb3597864163a25a48513e8e83cc95d27570ae.gifv',
        ],
        card_colors: [
          '#a05519',
          '#934715',
          '#863911',
          '#792a0c',
          '#6c1c08',
          '#5f0e04',
          '#520000',
        ],
        custom_font: { family: "'Tektur'", link: 'Tektur:wght@400;700' },
      },
      preview:
        'https://encrypted-tbn1.gstatic.com/images?q=tbn:ANd9GcTxg3h3BAMJ9P-r6LfhpuZ5iZS5HFSSaWQpyj09XiPVFsOJT9cB',
    },
    {
      color: 'gray',
      score: 4420,
      title: 'Hidden by Roman',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#363b45',
          'background-1': '#1a2026',
          'background-2': '#334352',
          borders: '#1a2026',
          links: '#657276',
          sidebar: 'linear-gradient(#1a2026, #363b45)',
          'sidebar-text': '#a0a3ab',
          'text-0': '#bec7cb',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: ['none'],
        card_colors: ['#000000'],
        custom_font: { family: "'Jost'", link: 'Jost:wght@400;700' },
      },
      preview:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Black.png/220px-Black.png',
    },
    {
      color: 'black',
      score: 3330,
      title: 'Jujutsu Kaizen by Keanu',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#000000',
          borders: '#000000',
          links: '#8400f0',
          sidebar: '#8400f0',
          'sidebar-text': '#000000',
          'text-0': '#c5c5c5',
          'text-1': '#c5c5c5',
          'text-2': '#c5c5c5',
        },
        custom_cards: [
          'https://giffiles.alphacoders.com/221/221248.gif',
          'https://i.pinimg.com/originals/73/d8/59/73d859fee54bf9548cd43dd76f59746c.gif',
          'https://media.tenor.com/images/e9d2e81bbfab46f31717efbd71021e38/tenor.gif',
          'https://i.pinimg.com/originals/a9/c0/5f/a9c05f7eb99cc939fbf58b751c3993f3.gif',
          'https://giffiles.alphacoders.com/221/221248.gif',
          'https://i.pinimg.com/originals/4a/fc/9b/4afc9b072b54a7e23b750bccf5d941cc.gif',
          'https://i.imgur.com/kOWcfEm.gif',
          'https://i.imgur.com/aPHfL3F.gif',
          'https://i.pinimg.com/originals/4a/fc/9b/4afc9b072b54a7e23b750bccf5d941cc.gif',
        ],
        card_colors: [
          '#e00024',
          '#c20048',
          '#a4006d',
          '#850091',
          '#6700b6',
          '#4900da',
          '#2b00ff',
          '#e00024',
          '#c20048',
          '#a4006d',
        ],
        custom_font: { family: "'Tektur'", link: 'Tektur:wght@400;700' },
      },
      preview:
        'https://media.tenor.com/images/e9d2e81bbfab46f31717efbd71021e38/tenor.gif',
    },
    {
      color: 'black',
      score: 4340,
      title: 'RED by Vitor',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#0f0000',
          'background-2': '#410101',
          borders: '#750000',
          links: '#780808',
          sidebar: '#0c0c0c',
          'sidebar-text': '#ff0000',
          'text-0': '#8a0000',
          'text-1': '#b80000',
          'text-2': '#db0000',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/95/a7/ee/95a7ee6150054b0fff6ea63031f9262a.jpg',
          'https://i.pinimg.com/236x/f4/37/22/f43722e9e3d3bd793d3622e61d54cf9c.jpg',
          'https://i.pinimg.com/236x/ba/ca/9c/baca9cffa808a0aeec427f42bda60e29.jpg',
          'https://i.pinimg.com/564x/7d/23/e0/7d23e000870e1f34ad2806b0efac5b17.jpg',
          'https://i.pinimg.com/564x/8f/1c/b7/8f1cb778eb1e00b9e2e04205dec363db.jpg',
          'https://i.pinimg.com/236x/4b/53/a8/4b53a82c408116cb623b87945b21de43.jpg',
          'https://i.pinimg.com/564x/0a/5e/21/0a5e2130ae6a8cc74cda7642ab0a4fdc.jpg',
          'https://i.pinimg.com/236x/e3/63/51/e363511163abf7b500af7f4bd8b7e579.jpg',
          'https://i.pinimg.com/564x/66/92/80/669280f29cfd7a29084b128d6d2484cd.jpg',
          'https://i.pinimg.com/236x/98/cc/81/98cc817ab86b49c07dca8fe16e70451b.jpg',
          'https://i.pinimg.com/564x/34/52/e7/3452e7682e6ea339b36ebe1a52763002.jpg',
        ],
        card_colors: ['#1a0101'],
        custom_font: { family: "'Lora'", link: 'Lora:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/236x/95/a7/ee/95a7ee6150054b0fff6ea63031f9262a.jpg',
    },
    {
      color: 'green',
      score: 4330,
      title: 'Masters by Todd',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#016545',
          'background-1': '#353535',
          'background-2': '#404040',
          borders: '#454545',
          links: '#fffb00',
          sidebar: '#f2ec02',
          'sidebar-text': '#016545',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://golfdigest.sports.sndimg.com/content/dam/images/golfdigest/fullset/2017/07/07/595fbd4e867dc5386b58b718_jack-nicklaus-masters-1986-sunday-17th-green-yes-sir-putt.jpg.rend.hgtvcom.1280.1920.suffix/1573332408680.jpeg',
          'https://wp.usatodaysports.com/wp-content/uploads/sites/87/2020/02/gettyimages-85836947.jpg',
          'https://dynaimage.cdn.cnn.com/cnn/c_fill,g_auto,w_1200,h_675,ar_16:9/https%3A%2F%2Fcdn.cnn.com%2Fcnnnext%2Fdam%2Fassets%2F220410183110-01-scottie-scheffler-masters-winner-2022.jpg',
          'https://photo-assets.masters.com/images/pics/large/h__04PMGJ_.jpg',
          'https://static01.nyt.com/images/2015/04/13/sports/13masters-hp/13masters-hp-superJumbo.jpg',
          'https://people.com/thmb/tgygpY8UiSUZtqNWxAilYU4zUSM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc():focal(659x289:661x291)/Masters-Tiger-Woods-1995-926b2b8b547448178aa60db791a257d9.jpg',
        ],
        card_colors: ['#fffb00'],
        custom_font: { family: "'https'", link: 'https:wght@400;700' },
      },
      preview:
        'https://dynaimage.cdn.cnn.com/cnn/c_fill,g_auto,w_1200,h_675,ar_16:9/https%3A%2F%2Fcdn.cnn.com%2Fcnnnext%2Fdam%2Fassets%2F220410183110-01-scottie-scheffler-masters-winner-2022.jpg',
    },
    {
      color: 'black',
      score: 4330,
      title: 'Shadow by Angela',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0b0b0a',
          'background-1': '#a30a0a',
          'background-2': '#711919',
          borders: '#ff0000',
          links: '#ff0000',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://st3.depositphotos.com/3336339/13622/i/450/depositphotos_136228590-stock-photo-red-pattern-with-chaotic-triangles.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#ffbb00',
          'text-1': '#e2e2e2',
          'text-2': '#c2c2c2',
        },
        custom_cards: [
          'https://community-cdn.topazlabs.com/original/3X/8/a/8a3e6beea70b99787cf78dd5f35b3d71f288d08c.jpeg',
          'https://cdn.staticneo.com/p/2012/1/sonic_adventure_2_image3.jpg',
          'https://images.nintendolife.com/screenshots/4358/900x.jpg',
          'https://cubemedia.ign.com/cube/image/article/645/645487/shadow-the-hedgehog-20050825004604252.jpg',
          'https://cdn.staticneo.com/p/2005/2/shadow_the_hedgehog_image_QHR62B8Di5YvykQ.jpg',
          'https://www.vgchartz.com/games/pics/1192318aaa.jpg',
        ],
        card_colors: ['#ff0000'],
        custom_font: {
          family: "'Roboto Mono'",
          link: 'Roboto+Mono:wght@400;700',
        },
      },
      preview:
        'https://cdn.staticneo.com/p/2012/1/sonic_adventure_2_image3.jpg',
    },
    {
      color: 'lightgreen',
      score: 3440,
      title: 'Western by Addisun',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#d0ece9',
          'background-1': '#a4ccc9',
          'background-2': '#e04a3d',
          borders: '#f37664',
          links: '#0d0d0d',
          sidebar:
            'linear-gradient(#fb9178c7, #fdf7f7c7), center url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR8pMzTcM4m6JKmxe4ETzGyzIOy3vHaIRA5wC4dmyGXTeUGj9iefCOYb4cHzUQ4-W2mcsU")',
          'sidebar-text': '#57635a',
          'text-0': '#050505',
          'text-1': '#0a0a0a',
          'text-2': '#0d0c0c',
        },
        custom_cards: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcQ_peGGbM7Hv-mBqougGObMff0qwG_zOXfA&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSDKwvJldAd8gEAW0zrROpusT22AtgYH60yqG89vgQ5LRmCyI3gnqd7ItBJV9tt5LDa0dU',
          'https://i.pinimg.com/originals/64/c9/b8/64c9b87d71fbb04eb1077d1ff8d04189.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYTIhrSWvwHNVUlC9sKeltJPL28M5VlFfV5SOC7xroVEIhFUveVauVbI41n1RclpKkheI',
          'https://i.pinimg.com/736x/8d/61/67/8d6167ca6f9cd935d80b43452a6b1b60.jpg',
        ],
        card_colors: ['#e71f63', '#fd5d10', '#ff9770', '#ffd670', '#009688'],
        custom_font: {
          family: "'Happy Monkey'",
          link: 'Happy+Monkey:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/originals/64/c9/b8/64c9b87d71fbb04eb1077d1ff8d04189.jpg',
    },
    {
      color: 'black',
      score: 3430,
      title: 'Foxes by Quix',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#0c0c0c',
          borders: '#1e1e1e',
          links: '#822101',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://st4.depositphotos.com/2595103/26276/v/450/depositphotos_262761216-stock-illustration-fox-seamless-pattern-drawing-animals.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://media1.tenor.com/m/Or8phd3kP8gAAAAd/cute-fox-pet-a-fox.gif',
          'https://media1.tenor.com/m/epF1RX2O8G0AAAAd/fox-pets.gif',
          'https://media1.tenor.com/m/LdNHlS5tndQAAAAd/fox-scared-face.gif',
          'https://media1.tenor.com/m/9BgAdAlV1UMAAAAd/heliflelfon-fox.gif',
          'https://media1.tenor.com/m/HPQABc8aSrQAAAAC/trickmint.gif',
          'https://media1.tenor.com/m/KM0nQ709PM0AAAAC/fox-fail.gif',
        ],
        card_colors: ['#636363'],
        custom_font: { link: 'Jost:wght@400;700', family: "'Jost'" },
      },
      preview: 'https://i.chzbgr.com/thumb1200/1924614/h4E7ABEDB',
    },
    {
      color: 'black',
      score: 4340,
      title: 'Purple by Caylee',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#080808',
          'background-1': '#0a0a0a',
          'background-2': '#0a0a0a',
          borders: '#2e2b3b',
          links: '#b1a2fb',
          sidebar:
            'linear-gradient(#101010c7, #101010c7), center url("https://i.pinimg.com/236x/80/f6/1f/80f61fadd498cd8201b678a8cdee2746.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/5d/5d/57/5d5d575b787857f9479b1cd0dbb9de60.jpg',
          'https://i.pinimg.com/564x/32/96/da/3296daa057132ef9c097b8d3c246fc2d.jpg',
          'https://i.pinimg.com/564x/11/aa/e8/11aae862af937617009c98e642f32f17.jpg',
          'https://i.pinimg.com/564x/fb/6a/3f/fb6a3f11bd127617121d61848bd86324.jpg',
          'https://i.pinimg.com/564x/8e/f6/cb/8ef6cbf3ab15e143177c89c577aacdc9.jpg',
          'https://i.pinimg.com/564x/51/72/a0/5172a0ba42b64b6a340ec46730718632.jpg',
        ],
        card_colors: [
          '#e0aaff',
          '#c77dff',
          '#9d4edd',
          '#7b2cbf',
          '#5a189a',
          '#e0aaff',
        ],
        custom_font: {
          family: "'Happy Monkey'",
          link: 'Happy+Monkey:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/fb/6a/3f/fb6a3f11bd127617121d61848bd86324.jpg',
    },
    {
      color: 'purple',
      score: 3340,
      title: 'Rainbow by Olivia',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#dbe4ff',
          'background-1': '#838caf',
          'background-2': '#88caf',
          borders: '#080821',
          links: '#121131',
          sidebar: '#c0c8f2',
          'sidebar-text': '#424242',
          'text-0': '#080821',
          'text-1': '#080821',
          'text-2': '#242461',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/cc/bf/3e/ccbf3e72eaa871a756997c8845b51b07.jpg',
          'https://i.etsystatic.com/11173961/r/il/888ec5/2778294284/il_fullxfull.2778294284_odl3.jpg',
          'https://e0.pxfuel.com/wallpapers/89/515/desktop-wallpaper-yellow-cute-cute-laptop-aesthetic-iphone-yellow-collage.jpg',
          'https://i.pinimg.com/originals/82/c2/f9/82c2f9a49fe2314c888d3e97337063f5.jpg',
          'https://wallpapers.com/images/hd/aesthetic-blue-collage-ix4imyjrgqsfdwv5.jpg',
          'https://static-01.daraz.pk/p/26e9404d3665f2702adf5b2c04c6db69.jpg',
          'https://i.pinimg.com/originals/f1/e0/1a/f1e01a671085d1978fe75096c2b36bf6.jpg',
          'https://parodyartprints.com/cdn/shop/products/p1_ba31958a-bab8-491b-bcfd-e28a2d069e28_1024x1024.jpg?v=1622569803',
        ],
        card_colors: ['#080821'],
        custom_font: { family: "'Comfortaa'", link: 'Comfortaa:wght@400;700' },
      },
      preview:
        'https://static-01.daraz.pk/p/26e9404d3665f2702adf5b2c04c6db69.jpg',
    },
    {
      color: 'black',
      score: 3420,
      title: 'ULTRAKILL by cringej0seph',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#000000',
          borders: '#ff0000',
          links: '#850000',
          sidebar: 'linear-gradient(#000000, #850000)',
          'sidebar-text': '#ff0000',
          'text-0': '#ff0000',
          'text-1': '#ff0000',
          'text-2': '#ff0000',
        },
        custom_cards: [
          'https://media1.tenor.com/m/fvPIoxOZfpYAAAAd/ultrakill-panopticon.gif',
          'https://media.tenor.com/pppxt-J_UHEAAAAi/naptrix-ultrakill.gif',
          'https://media.tenor.com/7w05Vx0dohgAAAAi/ultrakill-v1.gif',
          'https://media.tenor.com/dkihW5ZeWREAAAAi/v2-ultrakill.gif',
          'https://media1.tenor.com/m/ZIVst33YluUAAAAC/ultrakill-v1.gif',
          'https://media1.tenor.com/m/EPCwkA7pU0YAAAAd/ultrakill-v1.gif',
          'https://media1.tenor.com/m/SPwPzD2b4jIAAAAC/hop-on-ultrakill.gif',
          'https://media1.tenor.com/m/gjJ961YDII4AAAAd/ultrakill.gif',
        ],
        card_colors: ['#d90000', '#d90000', '#d90000', '#d90000'],
        custom_font: {
          family: "'Silkscreen'",
          link: 'Silkscreen:wght@400;700',
        },
      },
      preview:
        'https://cdn.cloudflare.steamstatic.com/steam/apps/1229490/capsule_616x353.jpg?t=1704406135',
    },
    {
      color: 'blue',
      score: 3240,
      title: 'Silly Cats by Stephanie',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0d0d21',
          'background-1': '#0d0d21',
          'background-2': '#341849',
          borders: '#0c466c',
          links: '#56Caf0',
          sidebar: '#0c466c',
          'sidebar-text': '#3f7eaa',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/46/88/1d/46881dbea1181428c18eb49f60212bd5.jpg',
          'https://i.pinimg.com/474x/0e/9f/5a/0e9f5a491305242147907ad86539f010.jpg',
          'https://i.pinimg.com/236x/74/51/d5/7451d50902dddb215e193734ac49981b.jpg',
          'https://i.pinimg.com/236x/cf/88/6a/cf886ad3d12477b4dee8f98072806dbd.jpg',
          'https://i.pinimg.com/736x/6d/e0/4e/6de04e262c56dc9a9b733eec9a16e5b3.jpg',
          'https://i.pinimg.com/236x/b3/d9/1e/b3d91e35684a51f3afa5abefae1a7ce5.jpg',
        ],
        card_colors: ['#3f7eaa'],
        custom_font: { family: "'Comfortaa'", link: 'Comfortaa:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/236x/74/51/d5/7451d50902dddb215e193734ac49981b.jpg',
    },
    {
      color: 'gray',
      score: 4340,
      title: 'Ascension by Jhil',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#272625',
          'background-1': '#282624',
          'background-2': '#1e1a1a',
          borders: '#423e3e',
          links: '#ebe0cb',
          sidebar:
            'linear-gradient(#ffeed6c7, #000000c7), center url("https://i.imgur.com/RnMvKQi.png")',
          'sidebar-text': '#2a1818',
          'text-0': '#ffffff',
          'text-1': '#d3c5c5',
          'text-2': '#f7cfcf',
        },
        custom_cards: [
          'https://i.imgur.com/b3MP58J.png',
          'https://i.imgur.com/qDzMvof.png',
          'https://images.squarespace-cdn.com/content/v1/54faf78ce4b04da0abdfbde8/9810940c-4781-40de-933e-01420b65744d/2.jpg?format=2500w%22,%22https://media.discordapp.net/attachments/947921061595467776/1206708709665935370/rain949_n.png?ex=65dcfe0f&is=65ca890f&hm=8b691e208dd4761573ffdee003a534293e2903f48cea8aab74cafce7333c6195&=&format=webp&quality=lossless&width=956&height=671%22,%22https://cdn.discordapp.com/attachments/947921061595467776/1206698634243211304/butterflyn2.jpg?ex=65dcf4ad&is=65ca7fad&hm=766cc3bea639c8f5c61b61cbd8d7a46c7184a2585a7d9df83ad7238a512331b6&%22,%22https://cdn.discordapp.com/attachments/947921061595467776/1206710271897505792/339665896_165676709697829_3001458454272430325_n.png?ex=65dcff84&is=65ca8a84&hm=866542409bfe9b44270a75c8c918ec737e6eaea0346b1fd1f993749686f57b46&%22,%22https://cdn.discordapp.com/attachments/947921061595467776/1206700487303503902/323502205_1266160280911065_2959231277940101662_n.png?ex=65dcf667&is=65ca8167&hm=03f9c02322e47d763f3112371b135000772101a93840beffc8aae1b95c380de0&%22]%7D',
          'https://i.imgur.com/stx45Sj.png',
          'https://i.imgur.com/jYYp07W.png',
          'https://i.imgur.com/uwga9LC.png',
          'https://i.imgur.com/Zmjn2qX.png',
        ],
        card_colors: [
          '#7a7069',
          '#6e645e',
          '#736861',
          '#776b63',
          '#786b61',
          '#65584f',
          '#52463d',
        ],
        custom_font: { family: '', link: '' },
      },
      preview: 'https://i.imgur.com/jYYp07W.png',
    },
    {
      color: 'green',
      score: 4230,
      title: 'Yosemite by Edmund',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#415336',
          'background-1': '#893924',
          'background-2': '#182618',
          borders: '#1a371c',
          links: '#28342a',
          sidebar: '#182618',
          'sidebar-text': '#e2e2e2',
          'text-0': '#83bebd',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSU08qbkZR9pBgJqm5f1uq-KtbxRc79BINX0A',
          'https://share.america.gov/wp-content/uploads/2014/09/2_6944696871_4a53be209e_k.jpg',
          'https://www.yosemite.com/wp-content/uploads/2023/04/yosemite-falls-1024x600-AdobeStock_504046427.jpg',
          'https://hikebiketravel.com/wp-content/uploads/2013/12/Sequoia-1.jpg',
          'https://madera.objects.liquidweb.services/photos/18885-img_4826.jpg',
          'https://madera.objects.liquidweb.services/photos/16842-half-dome-closeup-from-glacier-point-steve-montalto-hmi-Rectangle-600x400.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSU08qbkZR9pBgJqm5f1uq-KtbxRc79BINX0A',
        ],
        card_colors: [
          '#009463',
          '#007b52',
          '#006242',
          '#004a31',
          '#003121',
          '#001810',
          '#000000',
        ],
        custom_font: {
          family: "'Happy Monkey'",
          link: 'Happy+Monkey:wght@400;700',
        },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSU08qbkZR9pBgJqm5f1uq-KtbxRc79BINX0A',
    },
    {
      color: 'gray',
      score: 3240,
      title: 'HTTYD by Caillie',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0f0f0f',
          'background-1': '#0c0c0c',
          'background-2': '#141414',
          borders: '#1e1e1e',
          links: '#a0a089',
          sidebar: '#0c0c0c',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          ' https://i.pinimg.com/564x/e9/2d/c8/e92dc858130702892d67e4534bc44bea.jpg',
          'https://i.pinimg.com/564x/a6/bd/fa/a6bdfac8f9d457e2297d7324d61f0d42.jpg',
          'https://i.pinimg.com/736x/5a/08/47/5a0847ec23d1f7be70a5080ca44968d4.jpg',
          'https://i.pinimg.com/564x/bd/af/f9/bdaff9a79ac51eaa6102805024c7f9cc.jpg',
          'https://i.pinimg.com/564x/15/fc/27/15fc27e4bdc77b3d6de8a5a5cba08b93.jpg',
          'https://i.pinimg.com/564x/ef/18/74/ef1874a062e7552bfa16bf4a13936bac.jpg',
          'https://i.pinimg.com/564x/c4/98/de/c498def36e55c484b7f3f08a7b7334c9.jpg',
        ],
        card_colors: [
          '#a5a58d',
          '#626e7b',
          '#626e7b',
          '#626e7b',
          '#626e7b',
          '#626e7b',
          '#626e7b',
        ],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/e9/2d/c8/e92dc858130702892d67e4534bc44bea.jpg',
    },
    {
      color: 'blue',
      score: 4430,
      title: 'Evergarden by Junichiro',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#05061e',
          'background-1': '#0b0c28',
          'background-2': '#090920',
          borders: '#1a2442',
          links: '#ebc380',
          sidebar: '#1a2442',
          'sidebar-text': '#7f849c',
          'text-0': '#ebc380',
          'text-1': '#ae906d',
          'text-2': '#ebc380',
        },
        custom_cards: [
          'https://bakkunyan.files.wordpress.com/2017/11/d.gif',
          'https://i.redd.it/evbs7mmpnwz41.gif',
          'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/c2a4fd09-561a-4019-b2c9-6461fa3db151/dem3ja1-77d39576-2e9a-40a4-ae2a-3fe05459e35b.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2MyYTRmZDA5LTU2MWEtNDAxOS1iMmM5LTY0NjFmYTNkYjE1MVwvZGVtM2phMS03N2QzOTU3Ni0yZTlhLTQwYTQtYWUyYS0zZmUwNTQ1OWUzNWIuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.eX3ftBHLJtJ4Ebvp-VhS6V6mKKQIaRFYwBrLubL3dhM',
          'https://giffiles.alphacoders.com/209/209205.gif',
          'https://i.pinimg.com/originals/24/a6/7c/24a67c194d27536801d15f95cc4b3c02.gif',
          'https://mishatventures.files.wordpress.com/2018/03/tumblr_p2qwguuiqb1t0lt8go1_540.gif?w=761',
          'https://i.pinimg.com/originals/9f/92/62/9f926273bd71f6efde59a6f6c1e8b96f.gif',
          'https://gifdb.com/images/high/violet-evergarden-brooch-necklace-hold-0xmduinane3kdv7g.gif',
          'https://giffiles.alphacoders.com/115/115841.gif',
        ],
        card_colors: ['#ebc380'],
        custom_font: {
          family: "'EB Garamond'",
          link: 'EB+Garamond:wght@400;700',
        },
      },
      preview:
        'https://static.wikia.nocookie.net/violet-evergarden/images/a/ae/Violet_Evergarden.png/revision/latest?cb=20180209195829',
    },
    {
      color: 'red',
      score: 2440,
      title: 'Cyberpunk by Hadley',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#170005',
          'background-1': '#170005',
          'background-2': '#170005',
          borders: '#ff003c',
          links: '#ff003c',
          sidebar: '#170005',
          'sidebar-text': '#f5f5f5',
          'text-0': '#72eaf8',
          'text-1': '#d6d6d6',
          'text-2': '#72eaf8',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/de/14/fe/de14fe3a0837dd198411c12b16d3278e.gif',
          'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExdW5jZ2Nxc2docnBrYTh6bjM1MXF5emN1azU1aXl0M2U1NDhreW5nbCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ZkUMyzW7Q7quI/giphy.gif',
          'https://i.pinimg.com/originals/ca/b2/46/cab2463eccff08174ce7fe410b71da26.gif',
          'https://i.pinimg.com/originals/38/3e/0e/383e0edf60a2ae892a686b18acdcb148.gif',
          'https://i.pinimg.com/originals/8c/dc/13/8cdc13272525d79e858afba733529235.gif',
          'https://i.pinimg.com/originals/d1/e4/53/d1e45335d3511b17438ac850654d6c36.gif',
        ],
        card_colors: [
          '#417b8c',
          '#524298',
          '#5171a2',
          '#5864ab',
          '#497997',
          '#4c2185',
        ],
        custom_font: { family: "'Rajdhani'", link: 'Rajdhani:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/8c/dc/13/8cdc13272525d79e858afba733529235.gif',
    },
    {
      color: 'pink',
      score: 3440,
      title: 'Ghibliflowers by Annie',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#ffe0ed',
          'background-2': '#ff0066',
          borders: '#ff007b',
          links: '#ff0088',
          sidebar: '#f490b3',
          'sidebar-text': '#ffffff',
          'text-0': '#ff0095',
          'text-1': '#ff8f8f',
          'text-2': '#ff5c5c',
        },
        custom_cards: [
          'https://64.media.tumblr.com/3ea30da4f56c34ccb1141d9691390423/tumblr_p9t2ksYv8r1qa9gmgo10_r2_1280.jpg',
          'https://imagedelivery.net/9sCnq8t6WEGNay0RAQNdvQ/UUID-cl90fjfhv184494vmqyclfo49yv/public',
          'https://64.media.tumblr.com/273783fd75b836f7aa73d7ac55e39e5e/tumblr_p9t2ksYv8r1qa9gmgo4_r1_1280.jpg',
          'https://i.pinimg.com/736x/e4/ec/ae/e4ecae599a35af716ff4e31fd12952f1.jpg',
          'https://i.redd.it/wbfuh9xeimpb1.jpg',
          'https://i.pinimg.com/564x/92/ae/5a/92ae5ad0b4fb601d14de5c1805324a2c.jpg',
        ],
        card_colors: ['#ff0095'],
        custom_font: {
          link: 'Inria+Sans:wght@400;700',
          family: "'Inria Sans'",
        },
      },
      preview:
        'https://imagedelivery.net/9sCnq8t6WEGNay0RAQNdvQ/UUID-cl90fjfhv184494vmqyclfo49yv/public',
    },
    {
      color: 'lightgreen',
      score: 4440,
      title: 'Yotsuba by Rosanna',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#E3ECDD',
          'background-1': '#e7e7a5',
          'background-2': '#ea5757',
          borders: '#87bb60',
          links: '#ea5757',
          sidebar: 'linear-gradient(#8EC884, #6B936E)',
          'sidebar-text': '#E3ECDD',
          'text-0': '#151a56',
          'text-1': '#328c95',
          'text-2': '#151a56',
        },
        custom_cards: [
          'https://qph.cf2.quoracdn.net/main-qimg-c6c1e9f33bafa535420867c9e769177e-lq',
          'https://mangabrog.files.wordpress.com/2015/08/ytbheadeer.jpg?w=640',
          'https://imgix.ranker.com/list_img_v2/8134/2768134/original/manga-like-yotsuba-recommendations',
          'https://i.pinimg.com/736x/e9/4c/5e/e94c5e40d9ebfbfc9d6a63886cf7ff44.jpg',
          'https://mangabrog.files.wordpress.com/2015/08/cover1.jpg',
        ],
        card_colors: ['#ea5757'],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://qph.cf2.quoracdn.net/main-qimg-c6c1e9f33bafa535420867c9e769177e-lq',
    },
    {
      color: 'lightgreen',
      score: 4440,
      title: 'PastelGreen by Kai',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ebfcef',
          'background-1': '#a2f5b3',
          'background-2': '#8bf79d',
          borders: '#8bf7a4',
          links: '#2d802a',
          sidebar: '#76db8a',
          'sidebar-text': '#000000',
          'text-0': '#000000',
          'text-1': '#000000',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://ih0.redbubble.net/image.3235809503.1667/raf,360x360,075,t,fafafa:ca443f4786.jpg',
          'https://img.freepik.com/free-vector/hand-drawn-olive-green-background_23-2149724849.jpg?size=626&ext=jpg&ga=GA1.1.632798143.1705536000&semt=ais',
          'https://p16-va.lemon8cdn.com/tos-alisg-v-a3e477-sg/7d047e85ab274eaabe32e3ac27337e90~tplv-tej9nj120t-origin.webp',
          'https://ih1.redbubble.net/image.2945978530.3100/flat,750x1000,075,f.jpg',
          'https://img.freepik.com/premium-photo/green-aesthetic-classic-simple-floral-background-cover-journal-spiral_873036-53.jpg',
        ],
        card_colors: ['#60ba5d', '#92e88e', '#286b25', '#4ec248', '#6fbf6b'],
        custom_font: { family: "'Poppins'", link: 'Poppins:wght@400;700' },
      },
      preview:
        'https://p16-va.lemon8cdn.com/tos-alisg-v-a3e477-sg/7d047e85ab274eaabe32e3ac27337e90~tplv-tej9nj120t-origin.webp',
    },
    {
      color: 'purple',
      score: 2330,
      title: 'Purplewurple by Salomon',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#2e285d',
          'background-1': '#2e285d',
          'background-2': '#e9c3e2',
          borders: '#e9c3e2',
          links: '#e9c3e2',
          sidebar: '#2e285d',
          'sidebar-text': '#e9c3e2',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/29/f6/1c/29f61c6393a0cfd3bd1e577789150867.gif',
          'https://i.pinimg.com/originals/6d/ca/cf/6dcacf1b62d1d46006e558c41c1e8f88.gif',
          'https://i.pinimg.com/originals/ea/4d/66/ea4d66b32d8edf097d65924416022b1a.gif',
          'https://i.pinimg.com/originals/2e/73/f5/2e73f54bfd969a264820b1b9f5253db8.gif',
          'https://i.pinimg.com/originals/28/82/3d/28823dd54ece10453a17f2bbd8f015d3.gif',
          'https://i.pinimg.com/originals/f9/e7/22/f9e722d939d49636ea9bbfe0d0516df7.gif',
          'https://i.pinimg.com/originals/69/1f/48/691f48e7e3675020b2ba28b373a8915d.gif',
          'https://i.pinimg.com/originals/ab/ec/de/abecde4f61cca6c7ad413af0c097276a.gif',
          'https://i.pinimg.com/564x/c5/dd/c4/c5ddc4452ac52cad34a97439d220ed94.jpg',
          'https://i.pinimg.com/originals/0e/64/3e/0e643e1015b0f01d2de68b54554bc95f.gif',
          'https://i.pinimg.com/originals/ef/7a/42/ef7a420440306ae74ef664f2df513851.gif',
          'https://i.pinimg.com/originals/ef/7a/42/ef7a420440306ae74ef664f2df513851.gif',
        ],
        card_colors: [
          '#e9c3e2',
          '#177b63',
          '#794101',
          '#e9c3e2',
          '#e9c3e2',
          '#0076b8',
          '#008400',
          '#e9c3e2',
          '#e9c3e2',
          '#e9c3e2',
          '#e9c3e2',
          '#e9c3e2',
          '#e9c3e2',
          '#e9c3e2',
          '#e9c3e2',
        ],
        custom_font: {
          family: "'Happy Monkey'",
          link: 'Happy+Monkey:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/c5/dd/c4/c5ddc4452ac52cad34a97439d220ed94.jpg',
    },
    {
      color: 'pink',
      score: 3330,
      title: 'Roccoco by Linai',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffe0f5',
          'background-1': '#ffccef',
          'background-2': '#fed7fd',
          borders: '#f9bee0',
          links: '#fe71a9',
          sidebar: 'linear-gradient(#f3ddef, #ff0095)',
          'sidebar-text': '#ffccf8',
          'text-0': '#ff0059',
          'text-1': '#fe8bc2',
          'text-2': '#ffa3c3',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/b4/71/65/b47165a64779ddae7d33c98d175e863a.jpg',
          'https://i.pinimg.com/originals/e8/96/e1/e896e15094030a4602bae14db30e2713.jpg',
          'https://i.pinimg.com/originals/39/d5/83/39d583616237939700e0a3563a81a892.jpg',
          'https://i.pinimg.com/originals/1b/ff/f0/1bfff03b495f72b4d7afe01443fff830.jpg',
          'https://i.pinimg.com/originals/f6/83/48/f6834860d77b9f5cb89d51597646dd5b.jpg',
        ],
        card_colors: ['#e56182', '#e56182', '#e56182', '#e56182', '#e56182'],
        custom_font: { family: "'Caveat'", link: 'Caveat:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/f6/83/48/f6834860d77b9f5cb89d51597646dd5b.jpg',
    },
    {
      color: 'blue',
      score: 4340,
      title: 'Waves by Pia',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#adbfcd',
          'background-1': '#2e2e2e',
          'background-2': '#4e4e4e',
          borders: '#404040',
          links: '#9394ae',
          sidebar: '#aeafcd',
          'sidebar-text': '#f5f5f5',
          'text-0': '#7e7f9a',
          'text-1': '#70718f',
          'text-2': '#9b9cb0',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/cc/f7/aa/ccf7aae97e72deb487f05dd2157c3941.jpg',
          'https://w0.peakpx.com/wallpaper/702/891/HD-wallpaper-wave-blue-ocean-sea-thumbnail.jpg',
          'https://i.pinimg.com/236x/94/1b/9c/941b9c6296e053d99225bf6b4442f0a0.jpg',
          'https://i.pinimg.com/236x/4e/4e/72/4e4e72a411e829ee47dd3e3c96450b1a.jpg',
          'https://i.pinimg.com/236x/1f/f2/b7/1ff2b7ac82f535e501b020b3cb5909ff.jpg',
          'https://i.pinimg.com/236x/4e/4e/72/4e4e72a411e829ee47dd3e3c96450b1a.jpg',
          'https://cff2.earth.com/uploads/2022/07/12110923/Chago-whale-960x640.jpg',
          'https://i.pinimg.com/236x/29/f2/56/29f2560a91da3dab7597637dcf513607.jpg',
          'https://i.pinimg.com/474x/24/fa/ec/24faece37646a33d3309ac5f94b1cbe2.jpg',
        ],
        card_colors: [
          '#adbdcd',
          '#adbbcd',
          '#adb9cd',
          '#adb7cd',
          '#adb6cd',
          '#adb4cd',
          '#adb2cd',
          '#adb0cd',
          '#aeafcd',
        ],
        custom_font: {
          family: "'Expletus Sans'",
          link: 'Expletus+Sans:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/236x/1f/f2/b7/1ff2b7ac82f535e501b020b3cb5909ff.jpg',
    },
    {
      color: 'blue',
      score: 3240,
      title: 'SalShrine by not12fish',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#355eda',
          'background-1': '#00C1FF',
          'background-2': '#FFFF00',
          borders: '#fffffff',
          sidebar:
            'linear-gradient(#01c7, #0fc7), center url("https://4.bp.blogspot.com/-s7Ca91AdrUo/UmVc7kfCK-I/AAAAAAAAoLY/aukCMATg2tU/s1600/1882+Cliff+at+Varengeville+oil+on+canvas+Private+Collection.jpg")',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#ffffff',
          links: '#fffffff',
          'sidebar-text': '#ffffff',
        },
        custom_cards: [
          'https://artsdot.com/ADC/Art-ImgScreen-2.nsf/O/A-8XXRZM/$FILE/Claude_monet-water_lily_pond_8_.Jpg',
          'https://images.fineartamerica.com/images/artworkimages/mediumlarge/1/5-the-artists-garden-at-giverny-claude-monet.jpg',
          'https://3.bp.blogspot.com/-r9YfIOruALQ/WKDVLrokjeI/AAAAAAAANDI/fsWc_TTFkc0cRtqzQPMS3ELgicrcbVKPwCLcB/s1600/Claude%2BMonet%2BTutt%2527Art%2540%2B%25283%2529.jpg',
          'https://www.paintingmania.com/arts/claude-monet/large/pathway-monets-garden-giverny-1902-7_4407.jpg?version=11.11.20',
          'https://3.bp.blogspot.com/-IkIE84qrz1c/UttwMT0ME-I/AAAAAAAADoc/2ibI46M6ucI/s1600/sunflowers.jpg',
          'https://upload.wikimedia.org/wikipedia/commons/3/37/Claude_Monet_-_Springtime_-_Walters_3711.jpg',
          'https://external-content.duckduckgo.com/iu/?u=http%3A%2F%2Fmastereducacionsecundaria.files.wordpress.com%2F2012%2F03%2Fpuente.jpg&f=1&nofb=1&ipt=3c9954c9de3b403745e9e1faa942af326303ae2712df98c52aa624a29de5bf7d&ipo=images',
          'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fartsdot.com%2FADC%2FArt-ImgScreen-4.nsf%2FO%2FA-8XXRVK%2F%24FILE%2FClaude-monet-irises-in-monet-s-garden.Jpg&f=1&nofb=1&ipt=82f8da68dd741a52dca02641cd590c7ccd1a78b12d23139550d97b7fccd9d8e2&ipo=images',
          'https://upload.wikimedia.org/wikipedia/commons/2/29/Claude_Monet_037.jpg',
          'https://i.pinimg.com/originals/b9/84/63/b9846328c61f9059b7cbb9d90474fa0f.jpg',
          'https://upload.wikimedia.org/wikipedia/commons/9/9f/Claude_Monet_010.jpg',
          'https://www.christies.com/img/LotImages/2018/NYR/2018_NYR_16718_0010_000(claude_monet_nympheas_en_fleur).jpg',
        ],
        card_colors: ['#00C1FF'],
        custom_font: { link: 'Open+Sans:wght@400;700', family: "'Open Sans'" },
      },
      preview:
        'https://i.pinimg.com/originals/b9/84/63/b9846328c61f9059b7cbb9d90474fa0f.jpg',
    },
    {
      color: 'gray',
      score: 3330,
      title: 'TowerOfGod by Gabriela',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#adb9c2',
          'background-1': '#9199a1',
          'background-2': '#313030',
          borders: '#434242',
          links: '#484956',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://pbs.twimg.com/media/GGuTnnqbIAAKKSZ.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#030303',
          'text-1': '#050505',
          'text-2': '#171616',
        },
        custom_cards: [
          'https://www.pockettactics.com/wp-content/sites/pockettactics/2023/02/tower-of-god-tier-list-3.jpg',
          'https://pbs.twimg.com/media/E1y40hpXsAMxd3E.jpg:large',
          'https://www.gamespot.com/a/uploads/screen_kubrick/1581/15811374/4032493-towerofgod.jpg',
          'https://pbs.twimg.com/media/EY_dEFvXsAAD_87.jpg:large',
          'https://forumcdn.ngelgames.com/board/image/17332773-81c0-426b-89f5-70771a5734d2.png',
          'https://forumcdn.ngelgames.com/board/image/adba0314-e50a-4fe2-9553-eed10a370c4a.png',
          'https://pbs.twimg.com/media/F2WF4QebUAAR62_.jpg:large',
          'https://i.pinimg.com/originals/83/d9/aa/83d9aa54aa52b58943bcb94f168960b7.jpg',
          'https://dlhc.ngelgames.net/e/wbpc_23012003.png',
        ],
        card_colors: [
          '#3d3654',
          '#3c3a56',
          '#3b3e58',
          '#3a415a',
          '#39455c',
          '#38495e',
          '#374c60',
          '#365062',
          '#355464',
        ],
        custom_font: { family: "'Comfortaa'", link: 'Comfortaa:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/83/d9/aa/83d9aa54aa52b58943bcb94f168960b7.jpg',
    },
    {
      color: 'lightblue',
      score: 4430,
      title: 'Periwink by Mary',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fff5f7',
          'background-1': '#e6e7ef',
          'background-2': '#fff5f7',
          borders: '#445472',
          links: '#3f4e6b',
          sidebar: '#969ab7',
          'sidebar-text': '#455573',
          'text-0': '#455573',
          'text-1': '#455573',
          'text-2': '#7387b0',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/6d/c2/bc/6dc2bcd61e2f14d34ca0e5a27d159c9c.jpg',
          'https://i.pinimg.com/236x/a2/a4/67/a2a46702d04d2fbf02dca5b23ef4228d.jpg',
          'https://i.pinimg.com/564x/f3/20/80/f32080c839509736c2a79bfbbb74d7ef.jpg',
          'https://i.pinimg.com/236x/de/5e/09/de5e090f98505cf23f46da9ce8f4e7f5.jpg',
          'https://i.pinimg.com/236x/aa/e8/2a/aae82a63f75b9baae07a283226541bfc.jpg',
          'https://i.pinimg.com/236x/ff/47/d9/ff47d9db4c89e7173688f9b097edbc75.jpg',
          'https://i.pinimg.com/236x/96/d1/18/96d118766f0a59b633bf54b6581c5ae4.jpg',
          'https://i.pinimg.com/236x/26/9b/c9/269bc9de489b91993e3128dec6c50591.jpg',
          'https://i.pinimg.com/236x/0f/ad/81/0fad810613fdaefce169bc52872e9c8b.jpg',
          'https://i.pinimg.com/236x/e7/63/a9/e763a9dde21262f6d677778e9a3ec51f.jpg',
          'https://i.pinimg.com/236x/8e/02/0d/8e020dfa27dc7a0b07dd945d9e796dd4.jpg',
          'https://i.pinimg.com/564x/d7/94/d3/d794d3854ca3fe9cb42e15ef129a1da5.jpg',
          'https://i.pinimg.com/236x/e5/48/65/e548655a4b04d42f3e3407be8f65ade2.jpg',
          'https://i.pinimg.com/736x/ad/a9/ec/ada9ecd25ad571dbd931a9ab340d555c.jpg',
          'https://i.pinimg.com/564x/40/50/b4/4050b4be61446fab140809da11aa5c02.jpg',
        ],
        card_colors: ['#5e6989'],
        custom_font: { family: "'Comfortaa'", link: 'Comfortaa:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/236x/a2/a4/67/a2a46702d04d2fbf02dca5b23ef4228d.jpg',
    },
    {
      color: 'lightgreen',
      score: 4440,
      title: 'Serene by Aubrey',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f0fff1',
          'background-1': '#81a78a',
          'background-2': '#779c78',
          borders: '#91c099',
          links: '#010902',
          sidebar: '#81a78a',
          'sidebar-text': '#010902',
          'text-0': '#000501',
          'text-1': '#000501',
          'text-2': '#000500',
        },
        custom_cards: [
          'https://gifdb.com/images/thumbnail/green-aesthetic-anime-tea-pouring-vspd1gl3wrsfwgc0.gif',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTtRmrFbmUgOABnkeALiFTDuy4cn1O1fub5Jg',
          'https://img.wattpad.com/c7fb0bb0554d036f45df61433d055b5d7ef10d62/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f6332496f55786b616246646676673d3d2d313134363638353832352e3136623139303965353435363039653836373132323035353130372e676966',
          'https://images.nightcafe.studio/jobs/W4Pj3A6sSzeYp2uL6Lyw/W4Pj3A6sSzeYp2uL6Lyw.jpg?tr=w-1600,c-at_max',
          'https://64.media.tumblr.com/c6ab20de228a8aa509d3f8e1fb9654e8/tumblr_pdkhpkxNcE1t08lggo2_1280.png',
          'https://custom-doodle.com/wp-content/uploads/doodle/cat-in-the-gardent-green-anime-aesthetic/cat-in-the-gardent-green-anime-aesthetic-doodle.gif',
        ],
        card_colors: ['#808080'],
        custom_font: { family: "'Rakkas'", link: 'Rakkas:wght@400;700' },
      },
      preview:
        'https://images.nightcafe.studio/jobs/W4Pj3A6sSzeYp2uL6Lyw/W4Pj3A6sSzeYp2uL6Lyw.jpg?tr=w-1600,c-at_max',
    },
    {
      color: 'gray',
      score: 4441,
      title: 'Frog&Toad by Grungemuffin',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e6e6e6',
          'background-1': '#f5f5f5',
          'background-2': '#d4d4d4',
          borders: '#c7cdd1',
          links: '#738678',
          sidebar: '#668326',
          'sidebar-text': '#ffffff',
          'text-0': '#9c5c1c',
          'text-1': '#668326',
          'text-2': '#a5a5a5',
        },
        custom_cards: [
          'https://i1.wp.com/www.slaphappylarry.com/wp-content/uploads/2020/04/Frog-and-Toad-riding-a-bicycle-built-for-two.jpeg?resize=525%2C387&ssl=1',
          'http://3.bp.blogspot.com/-dBtjgNQXS5I/T9Z1NHBtICI/AAAAAAAAU1Q/7CG3WdZSxRU/s1600/frog-and-toad.jpg',
          'https://i.pinimg.com/originals/30/96/59/30965954ef03454d3bab9153f6f5e33f.png',
          'https://i0.wp.com/avdi.codes/wp-content/uploads/2019/05/Frog-and-Toad-illustratio-007.jpg?resize=460%2C276&ssl=1',
          'https://media.newyorker.com/photos/5909772b1c7a8e33fb38f8dc/master/w_1600%2Cc_limit/FrogandToad2.jpg',
          'https://i.pinimg.com/originals/03/cc/e9/03cce99bf3e0361ecd2a1b07ec32d470.jpg',
        ],
        card_colors: ['#668326'],
        custom_font: { link: 'Corben:wght@400;700', family: "'Corben'" },
      },
      preview:
        'https://i0.wp.com/avdi.codes/wp-content/uploads/2019/05/Frog-and-Toad-illustratio-007.jpg?resize=460%2C276&ssl=1',
    },
    {
      color: 'black',
      score: 4420,
      title: 'Tron by Angel',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#000000',
          borders: '#000000',
          links: '#7dfdfe',
          sidebar: '#000000',
          'sidebar-text': '#7dfdfe',
          'text-0': '#7dfdfe',
          'text-1': '#7dfdfe',
          'text-2': '#7dfdfe',
        },
        custom_cards: [
          'https://www.hollywoodreporter.com/wp-content/uploads/2023/08/MCDTRLE_EC040-H-2023.jpg',
          'https://m0vie.files.wordpress.com/2010/12/tronlegacy3.jpg?w=584',
          'https://images-prod.dazeddigital.com/862/0-0-862-575/azure/dazed-prod/610/2/612885.jpg',
          'https://i.ytimg.com/vi/YyoKXfBQgXw/maxresdefault.jpg',
          'https://lh3.googleusercontent.com/proxy/xso8Y-CNIWDVk9Nt6Kj5-icIcJgEH2jYCmS08hZeNxWvZ7DSL0UNBa2qMCciLo8QH2Htpv2b',
          'https://i0.wp.com/www.artofvfx.com/wp-content/uploads/2011/03/TRONLEGACY_PF_VFX_05.jpg?fit=1200%2C675&ssl=1',
          'https://m0vie.files.wordpress.com/2010/12/tronlegacy2.jpg?w=584',
          'https://4.bp.blogspot.com/-utv3M4YQbRI/Vv7twW1o69I/AAAAAAAAWFA/wyONVSS4cwQKTv6dasSL1K15alu-T6E1g/s640/tron%2Blegacy%2B4.jpg',
        ],
        card_colors: ['#7dfdfe'],
        custom_font: { family: "'Orbitron'", link: 'Orbitron:wght@400;700' },
      },
      preview:
        'https://m0vie.files.wordpress.com/2010/12/tronlegacy2.jpg?w=584',
    },
    {
      color: 'purple',
      score: 4440,
      title: 'Spiderverse by Kata',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#140e21',
          'background-1': '#4e078c',
          'background-2': '#cd7eec',
          borders: '#140e21',
          links: '#1dd6f7',
          sidebar:
            'linear-gradient(#1b1429c7, #1f1920c7), center url("https://i.pinimg.com/564x/50/3c/21/503c2125979bd223a09967df7d97d235.jpg")',
          'sidebar-text': '#f2f2f2',
          'text-0': '#ffffff',
          'text-1': '#ff0bd9',
          'text-2': '#ededed',
        },
        custom_cards: [
          'https://64.media.tumblr.com/ad3512669f35588f49249f3cf5bd2d0f/a07f1340a77bfbbd-10/s500x750/43ff34218d9c15c957818cb7fd9f5aa7e208f115.gif',
          'https://64.media.tumblr.com/e47fcb6a7ce22459f0b9255844daa62b/13a0e8fd1731317e-6e/s540x810/c13106fb092164b827562368c1d35164a5ce663c.gif',
          'https://akm-img-a-in.tosshub.com/sites/dailyo//resources/202306/spiderverse-across-the-spiderverse010623125842.gif',
          'https://64.media.tumblr.com/2b04d543ec4f3af5d2b072fe34fccda0/7be1b2f1a4c2c858-b5/s500x750/0a8c71906a75c6e1b0aa2ad949645b7ccfe7a660.gif',
          'https://images.squarespace-cdn.com/content/v1/5fe91ea6c16c6b61cb4b3e5a/1686254452129-OAXC5PB58MAMQBB5T2HN/across-the-spider-verse-spider-man.gif',
          'https://64.media.tumblr.com/436e4c6dbe18c709198c587f32f5d2a4/f3c1a6ec900f4263-bf/s640x960/3484b386cc611e3478f1212f55398d98067ceed1.gif',
          'https://miro.medium.com/v2/resize:fit:679/1*Q3htNkx8v3pdmvVL9SRc0g.gif',
        ],
        card_colors: [
          '#6f44fc',
          '#c063e6',
          '#c063e6',
          '#c063e6',
          '#4475fc',
          '#9816e4',
          '#12c8ff',
        ],
        custom_font: {
          family: "'Inconsolata'",
          link: 'Inconsolata:wght@400;700',
        },
      },
      preview: 'https://media.timeout.com/images/106011281/750/422/image.jpg',
    },
    {
      color: 'brown',
      score: 4430,
      title: 'Flowers by Kearsten',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ddbfa2',
          'background-1': '#ad7638',
          'background-2': '#8f6134',
          borders: '#6b4927',
          links: '#412c18',
          sidebar: '#77512b',
          'sidebar-text': '#d4af8a',
          'text-0': '#412c18',
          'text-1': '#412c18',
          'text-2': '#412c18',
        },
        custom_cards: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQrsuXBympaByTYYSy9v2P0CLjg-U4AXesBs9RZ0rKpu2xplFky7_seXGLlTQ&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTl6r3J-wKPXHuZzTb53zLtYv_tcYu5V7RrFQ',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSjmrsfQGstoqMZr_wU26UK_9ZXGRRe_5DStQ',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyq08u1gaMiKSrg53-lMi9Nuxvq-xWiSrSQhToP4sAQyhZtRUFZRCjb2gGCfSbJijOAJQ',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLjJSjhqpGfTmAsv6moCYCcdBDZNgqb2xx6Q',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS1f-um6axhYow-ipOxEvGcIQN4r2oYhigKYw',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTReMSJPkYyed-rZav6uyDabeJTuz76_m9BldJ5Louy_G3Z9o0CjgMI5Y1TVeoA0pT1oBU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQZExZqBx-9itWVPLwOCaGUJzohfeRSO9VAgA',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQEwmxCToKmO3HWmGzYECBwCtD6ENj-RHjOnw',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRQm1jdWAs1dVggneKtkaZeIp6ZwKyPwThUlg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTFGslwpWwOvJmztTkeWcuY2oDBAE1QG16dGzFyacPINRORvPqqNolsvuqJMQ&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTk1cc25PUrSTyhIjHh7fSyrMwqtnhkXkDQziPPzJkhxyAl-oTZsTG3p6yTDA&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQdp2FeMA946MsXvKn4pjKGwre41xo-TOb83g',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFYxkkYlEJ76aatPrNmFA65B-ogSB9qAQdWA',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRM5fITYxcqn6fW63KbK1HfmGoQbsna2XcoXQ',
        ],
        card_colors: ['#a16e3b'],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFYxkkYlEJ76aatPrNmFA65B-ogSB9qAQdWA',
    },
    {
      color: 'gray',
      score: 4240,
      title: 'Cyberpunk by Rifka',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#101010',
          'background-1': '#121212',
          'background-2': '#1a1a1a',
          borders: '#ffffff',
          sidebar: '#000000',
          'text-0': '#fffff',
          'text-1': '#ffffff',
          'text-2': '#ababab',
          links: '#a800df',
          'sidebar-text': '#00dfff',
        },
        custom_cards: [
          'https://64.media.tumblr.com/58c9b98748c4932ad5f8dc6746281272/2190878974818fad-60/s400x600/01f23adf2ea96b5fde1e77c8121c544810083bce.gifv',
          'https://64.media.tumblr.com/afaf1d33a29b80841edfaf90be6588ec/229ae35e51eebedf-62/s400x600/4783d808dcb90c9e200b35b0ac28cdf706e636c8.gifv',
          'https://64.media.tumblr.com/225b1e97c116a99f1eb5ff7afd1899a4/2e61622cd5d84ae5-94/s400x600/2a9de6ace593c13e233a0d9e9d6987a1bdab3c07.gifv',
          'https://64.media.tumblr.com/a36967f4b6770ce0dc921d6f8640f0ff/e433885f87131ceb-8f/s400x600/c1c5b544b2122771a9703a4af49e39c17b2eb02b.gifv',
          'https://64.media.tumblr.com/2dfedd1128b0bf84f894f38318135a88/5327448c4e60b7a8-21/s400x600/3eefe619820a92bba5ebd8705cc1de500f4482f7.gifv',
          'https://64.media.tumblr.com/28a8ecb4a85857259db96a8c2b16b00e/0f483b313cff61c9-be/s400x600/44afd6a4dd96d3ddb81ef0a552d3f5f37154375a.gif',
          'https://64.media.tumblr.com/2c33f4e6e264cad6fe5b2695cb30472d/25d9c76169467b66-d6/s400x600/dd954965cf989828f7250ee496ff4a58a5027eda.gifv',
        ],
        card_colors: ['#a800df'],
        custom_font: {
          link: 'Pixelify+Sans:wght@400;700',
          family: "'Pixelify Sans'",
        },
      },
      preview:
        'https://64.media.tumblr.com/2dfedd1128b0bf84f894f38318135a88/5327448c4e60b7a8-21/s400x600/3eefe619820a92bba5ebd8705cc1de500f4482f7.gifv',
    },
    {
      color: 'pink',
      score: 3440,
      title: 'Cute by Noelle',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffebf2',
          'background-1': '#fcbce8',
          'background-2': '#ae808c',
          borders: '#fca3d8',
          links: '#cc85af',
          sidebar:
            'linear-gradient(#e1e0e0c7, #c89797c7), center url("https://th.bing.com/th/id/OIP.L79DXEf-CLSDrCpUMAvGRwHaLH?rs=1&pid=ImgDetMain")',
          'sidebar-text': '#ffffff',
          'text-0': '#a77287',
          'text-1': '#fb88c8',
          'text-2': '#cc619f',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/ed/74/1a/ed741a73c04ce0eef4c5ad82aa70f3ba.jpg',
          'https://i.pinimg.com/564x/a1/03/84/a103845f7159f22b1eccfe698e53cf3c.jpg',
          'https://i.pinimg.com/564x/33/7e/22/337e22d1c7082640cfb0afc8f672a419.jpg',
          'https://i.pinimg.com/564x/5b/d2/9c/5bd29c1a05db05dd210c395c0a414e37.jpg',
          'https://i.pinimg.com/564x/5d/3b/72/5d3b72070d966731d891cc6779b57509.jpg',
          'https://i.pinimg.com/736x/39/d0/2e/39d02ed2d818981db63c81721a511ee7.jpg',
        ],
        card_colors: [
          '#db93aa',
          '#f7b2de',
          '#de87be',
          '#f29bbe',
          '#f7b2c8',
          '#db93aa',
          '#f7b2de',
        ],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/5d/3b/72/5d3b72070d966731d891cc6779b57509.jpg',
    },
    {
      color: 'white',
      score: 4440,
      title: 'Tacobell by Annaliese',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#f5f5f5',
          'background-2': '#d4d4d4',
          borders: '#c7cdd1',
          links: '#a1a1a1',
          sidebar: '#60466d',
          'sidebar-text': '#ffffff',
          'text-0': '#666666',
          'text-1': '#919191',
          'text-2': '#a5a5a5',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/79/ef/5b/79ef5b752375ef92df66fc1b7f25c54c.jpg',
          'https://tb-static.uber.com/prod/image-proc/processed_images/5c06441c9e26a8a332f76c8c3d77b610/5954bcb006b10dbfd0bc160f6370faf3.jpeg',
          'https://www.taco-bell.ro/wp-content/uploads/crunchwrap-simplu.png',
          'https://substackcdn.com/image/fetch/f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fbucketeer-e05bbc84-baa3-437e-9518-adb32be77984.s3.amazonaws.com%2Fpublic%2Fimages%2Fb2a8ce76-d72c-4a3f-b4e8-c4d3526b4862_3264x1836.jpeg',
          'https://tacobell.com.au/wp-content/uploads/2020/05/Meal-Grilled-Stuft-Burrito.png',
        ],
        card_colors: [
          '#25171a',
          '#4b244a',
          '#533a7b',
          '#6969b3',
          '#7f86c6',
          '#25171a',
          '#4b244a',
          '#533a7b',
          '#6969b3',
          '#7f86c6',
        ],
        custom_font: { family: "'Poppins'", link: 'Poppins:wght@400;700' },
      },
      preview:
        'https://tacobell.com.au/wp-content/uploads/2020/05/Meal-Grilled-Stuft-Burrito.png',
    },
    {
      color: 'orange',
      score: 2120,
      title: 'THEME by Dalila',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f8a382',
          'background-1': '#F67280',
          'background-2': '#C06C84',
          borders: '#C5E7B',
          links: '#355C7D',
          sidebar: '#355C7D',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/87/87/b4/8787b48e6e7f084b71cff1fd11cc5e73.gif',
          'https://media1.giphy.com/media/l3vRdDjIXS9dmt2Vi/giphy.gif',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsis9hJTKJXZheHchbF10kXRZKYjRlsXkZrw',
          'https://media4.giphy.com/media/Y8AeLA5ZRSREY/giphy.gif?cid=6c09b952apmfzj9gmfzjatex930izsrbu83xagkziv1ahw9x&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=g',
          'https://gifdb.com/images/high/emma-stone-crying-ft5r7z63iuyox4ov.gif',
          'https://media.tenor.com/1kZ2j73pGDUAAAAC/capybara-ok-he-pull-up.gif',
          'https://i.pinimg.com/originals/b1/90/87/b1908765be9fad1cee19fcb4c0156aea.gif',
          'https://media1.giphy.com/media/h1QI7dgjZUJO60nu2X/giphy.gif',
        ],
        card_colors: ['#355C7D'],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTsis9hJTKJXZheHchbF10kXRZKYjRlsXkZrw',
    },
    {
      color: 'purple',
      score: 4340,
      title: 'Pixels by Hudson',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000014',
          'background-1': '#000014',
          'background-2': '#000014',
          borders: '#2e2b3b',
          links: '#b1a2fb',
          sidebar: 'linear-gradient(#3d0032, #101010)',
          'sidebar-text': '#ffffff',
          'text-0': '#ffffff',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://media1.giphy.com/media/NKEt9elQ5cR68/giphy.gif?cid=6c09b952ezxxqofmkqzxo07p5nufozllngrxo95kkrj3yeft&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media1.tenor.com/m/_EYOsX_1CUkAAAAC/pixel-night.gif',
          'https://i.redd.it/zbpfhnl6piw91.gif',
          'https://neocha-content.oss-cn-hongkong.aliyuncs.com/wp-content/uploads/sites/2/2019/01/pixel-perfect-close-up-01.gif',
          'https://i.pinimg.com/originals/ce/ca/ba/cecabaac30736b17f7f278422ef861c0.gif',
          'https://steamuserimages-a.akamaihd.net/ugc/848220645315815123/5D7C6C01038CFD5C81C5AE0AF60E9F16FF05272F/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false',
          'https://i.pinimg.com/originals/83/b8/09/83b809857acd41a7bad4935b4734f9fc.gif',
        ],
        card_colors: [
          '#a218b1',
          '#8730be',
          '#6c48cb',
          '#5161d8',
          '#2e67c3',
          '#1469af',
          '#007bb8',
        ],
        custom_font: {
          family: "'Comic Sans MS'",
          link: 'Comic Sans MS:wght@400;700',
        },
      },
      preview: 'https://media1.tenor.com/m/_EYOsX_1CUkAAAAC/pixel-night.gif',
    },
    {
      color: 'lightblue',
      score: 3440,
      title: 'NWJNS by Ethan',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e9e8e6',
          'background-1': '#e9e8e6',
          'background-2': '#9fb8d2',
          borders: '#0e266b',
          links: '#596799',
          sidebar: 'linear-gradient(#0e266b, #9fb8d2)',
          'sidebar-text': '#e9e8e6',
          'text-0': '#4c6494',
          'text-1': '#545c90',
          'text-2': '#545c90',
        },
        custom_cards: [
          'https://media.tenor.com/h_Oy9rpwy5gAAAAM/minji-what.gif',
          'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExZzZ6OGxjZWJrYmpkaHV6eHUyM3licTR0cXc2cWo1anZ2ZzI0bzkyaSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/vI35jPmy3KgIMpupYI/giphy.gif',
          'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMTZxODA1bDR0c2oyaDdtdTcybWxkNXA4ZjBjYWg2cWd4aGhrbHFpdiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/zKhkIqbPNEwCwfEjUn/giphy.gif',
          'https://cdn.shopify.com/s/files/1/0662/1872/1536/files/giphy_6_4c4eefde-2b2f-4dd2-8fe2-f2b0008f2788.gif?v=1687333389',
          'https://media.tenor.com/H0h37crTwgUAAAAM/hyein-lee-hyein.gif',
          'https://media1.tenor.com/m/2uzVnVdFaiIAAAAC/newjeans-get-up-1st-ep.gif',
          'https://media1.tenor.com/m/1ueFAV04dCAAAAAC/newjeans-fire-newjeans.gif',
          'https://media.tenor.com/meZiCF6wF90AAAAM/newjeans-newjeans-bunny.gif',
        ],
        card_colors: [
          '#dbdcdf',
          '#ced0d8',
          '#c1c4d1',
          '#b4b9ca',
          '#a7adc3',
          '#9aa1bc',
          '#8d95b5',
          '#808aae',
          '#737ea7',
          '#6672a0',
          '#596799',
        ],
        custom_font: { family: "'Red Rose'", link: 'Red+Rose:wght@400;700' },
      },
      preview: 'https://media.tenor.com/h_Oy9rpwy5gAAAAM/minji-what.gif',
    },
    {
      color: 'purple',
      score: 4440,
      title: 'Purple by Karoline',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e9cdf9',
          'background-1': '#c77dff',
          'background-2': '#9d4edd',
          borders: '#7b2cbf',
          links: '#5a189a',
          sidebar: '#a079d2',
          'sidebar-text': '#fafafa',
          'text-0': '#3c096c',
          'text-1': '#240046',
          'text-2': '#10002b',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/98/6c/ae/986caeaaa4133b001f7699429d920706.jpg',
          'https://i.pinimg.com/564x/3c/6c/1f/3c6c1f59abd29fb71e4890a8c13aeef0.jpg',
          'https://i.pinimg.com/564x/7b/df/bc/7bdfbc8f33434b7ccc2ba0baa771af61.jpg',
          'https://i.pinimg.com/564x/1e/fd/e2/1efde2b53c011134c33f423a0cd35ac5.jpg',
          'https://i.pinimg.com/564x/c9/98/5c/c9985c140312261ea62f605075fbccf2.jpg',
          'https://i.pinimg.com/564x/d1/e6/3c/d1e63cfc15dc1bb9aee4243c808a17c4.jpg',
        ],
        card_colors: [
          '#3c1361',
          '#52307c',
          '#7c5295',
          '#d9a6f7',
          '#663a82',
          '#d7a1f2',
          '#c77dff',
        ],
        custom_font: {
          family: "'Josefin Slab'",
          link: 'Josefin+Slab:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/d1/e6/3c/d1e63cfc15dc1bb9aee4243c808a17c4.jpg',
    },
    {
      color: 'lightblue',
      score: 4440,
      title: 'Seablue by Jane',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fff9f0',
          'background-1': '#f7f2eb',
          'background-2': '#f7f2eb',
          borders: '#d0e3ff',
          links: '#081f5c',
          sidebar: 'linear-gradient(#7096d1, #d0e3ff)',
          'sidebar-text': '#f7f2eb',
          'text-0': '#081f5c',
          'text-1': '#081f5c',
          'text-2': '#d0e3ff',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/b1/1a/60/b11a608a4746f343a758c70ae9b70570.jpg',
          'https://i.pinimg.com/564x/32/e7/1a/32e71a8725bdf8792e4fd0ad10b0fcd5.jpg',
          'https://i.pinimg.com/564x/4c/52/66/4c5266c8cdfe07bdeb677cbc1e514a28.jpg',
          'https://i.pinimg.com/564x/bd/da/d3/bddad35d67ab4b3beae0e9dc3f891bfb.jpg',
          'https://i.pinimg.com/474x/47/9c/02/479c0238026c33b617cecbc644a34db4.jpg',
          'https://i.pinimg.com/736x/03/08/fb/0308fb9d9aa557c226c3ed12bf74d090.jpg',
          'https://i.pinimg.com/564x/cd/cc/47/cdcc47fdc8db99a75386291bfb4331aa.jpg',
        ],
        card_colors: ['#7096d1'],
        custom_font: { family: "'Comfortaa'", link: 'Comfortaa:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/474x/47/9c/02/479c0238026c33b617cecbc644a34db4.jpg',
    },
    {
      color: 'brown',
      score: 4340,
      title: 'Classicjapan by David',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#c3b2a2',
          'background-1': '#dfd1aa',
          'background-2': '#d9b492',
          borders: '#96865a',
          links: '#1e1d77',
          sidebar: 'linear-gradient(#bfa088, #c5c4c4)',
          'sidebar-text': '#f3fbcb',
          'text-0': '#ffe6c2',
          'text-1': '#142c90',
          'text-2': '#272f9b',
        },
        custom_cards: [
          'https://www.tallengestore.com/cdn/shop/products/WhalingOffGoto_OceansofWisdomseries_-KatsushikaHokusai-JapaneseWoodcutUkiyo-ePainting_4afb7700-3361-4f6c-97a9-700f3190a926_large.jpg?v=1622029074',
          'https://johngaber.files.wordpress.com/2017/10/the-great-wave-off-kanagawa.jpg?w=775',
          'https://johngaber.files.wordpress.com/2017/10/the-great-wave-off-kanagawa.jpg?w=775',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxIbcpUIpy-PH0LU3Zx1ogktWfWhm5lNh4yA&usqp=CAU',
          'https://www.japanese-painting.com/artist/taikan_yokoyama/image/4006-island_reflects_the_sunrise.jpg',
          'https://collectionapi.metmuseum.org/api/collection/v1/iiif/53789/preview',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoo8cKq8sFcyhk41zf3t4L60Qzb7gl2ZE-8A&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQMzb90fCi2axbogYmEt7d2VKr8tLHkmIt0pw&usqp=CAU',
          'https://i.ebayimg.com/images/g/-NEAAOSwA9tdDQsU/s-l400.jpg',
        ],
        card_colors: [
          '#e7e6f7',
          '#e3d0d8',
          '#aea3b0',
          '#827081',
          '#c6d2ed',
          '#e7e6f7',
          '#e3d0d8',
          '#aea3b0',
          '#827081',
        ],
        custom_font: {
          family: "'Permanent Marker'",
          link: 'Permanent+Marker:wght@400;700',
        },
      },
      preview:
        'https://www.japanese-painting.com/artist/taikan_yokoyama/image/4006-island_reflects_the_sunrise.jpg',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'Miyamura by Emma',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f7f5f3',
          'background-1': '#304a48',
          'background-2': '#f7f5f3',
          borders: '#283d3b',
          sidebar: 'linear-gradient(#b88e8d, #3f2827)',
          'text-0': '#b88e8d',
          'text-1': '#b88e8d',
          'text-2': '#3f2827',
          links: '#3f2827',
          'sidebar-text': '#f7f5f3',
        },
        custom_cards: [
          'https://64.media.tumblr.com/e3f330dcd1b35a813be425e232e29fc9/ff5adc839085053c-0f/s400x600/8798403179aaa7f36a1cb36f96b3ee1473971dce.gifv',
          'https://64.media.tumblr.com/bed085d00dbd0fa182afd7aec0ad698c/74f20d8e82ab92e0-6e/s500x750/d0b26da9f31fbe261e0d2569d1d87b58a5619a7c.gifv',
          'https://img.wattpad.com/596b9698df6e73aba3b549c3908c518293266327/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f316c4b484a53474d3965647331773d3d2d313137353533373734362e313663373938393738306563653737623932363836333031383634332e676966',
          'https://64.media.tumblr.com/1f59b179d7325610b6321dcd2b535382/f359fe20ddd5ec53-ae/s400x600/c02e5d21bc07d401b3401918e56625a66aa446da.gifv',
          'https://64.media.tumblr.com/3177738c7bbca10c581d5a3a7f3561b1/ccc53a1276774357-bb/s400x600/406de24e5337ef6eab7712b83eb121c2077bc95b.gifv',
          'https://64.media.tumblr.com/24a2bf303106e5e8a4586128c3c8cafd/36983a09ce762c06-20/s1280x1920/75ef248958fa4a63860cddc445fd19420d3669f0.gifv',
        ],
        card_colors: ['#eaac8b', '#e56b6f', '#b56576', '#6d597a', '#eaac8b'],
        custom_font: { link: 'DM+Sans:wght@400;700', family: "'DM Sans'" },
      },
      preview:
        'https://thicc-af.mywaifulist.moe/waifus/miyamura-izumi/4xxzW48ZLxdhhL9ywryRvOPJYpu38VBVdC8VeDZ6.jpg?class=thumbnail',
    },
    {
      color: 'lightgreen',
      score: 3330,
      title: 'ATLA by Adria',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#FFFFED',
          'background-1': '#BEC7B4',
          'background-2': '#8DA290',
          borders: '#1e1e1e',
          links: '#3e6558',
          sidebar: 'linear-gradient(#9DC183, #758467)',
          'sidebar-text': '#f5f5f5',
          'text-0': '#758467',
          'text-1': '#9CAF88',
          'text-2': '#5C7650',
        },
        custom_cards: [
          'https://media3.giphy.com/media/273fZpQzB8Kxq/giphy.webp?cid=ecf05e47pn9rfh8lffsophbsvdjnk1bl84mwg9k5jm01rf25&ep=v1_gifs_search&rid=giphy.webp&ct=g',
          'https://media1.tenor.com/m/lP-4bk-owRsAAAAC/aang-atla.gif',
          'https://media1.giphy.com/media/3o7WIrlRuGN7dp8veM/200.webp?cid=ecf05e47fpg1lfilan6c2km8jiofo36vbi3rr81w5pw4nrs2&ep=v1_gifs_search&rid=200.webp&ct=g',
          'https://media4.giphy.com/media/4IzOgM1bfOe6k/200.webp?cid=ecf05e47lig48wi1zw8gs49k3l56iovg7841yxq96be7co5x&ep=v1_gifs_search&rid=200.webp&ct=g',
          'https://animatedmeta.files.wordpress.com/2015/03/atla-flower-crowns.gif',
          'https://i.pinimg.com/originals/63/09/73/630973392fe2eaf38c957971809c737a.gif',
          'https://media4.giphy.com/media/geHdlUjc2MzKwaIxoE/200.webp?cid=ecf05e47bllr8vtm9t3cz39a1oixa6fgmq3a8ba1ica8jz41&ep=v1_gifs_search&rid=200.webp&ct=g',
          'https://animatedmeta.files.wordpress.com/2015/03/atla-sokka-calculating.gif',
          'https://media1.giphy.com/media/5fiHGcQ7mQC9DekqqO/200.webp?cid=ecf05e474dfwvj9jsfyikskci4hh7nd5xctwnuh7m9vxpwwp&ep=v1_gifs_search&rid=200.webp&ct=g',
          'https://media1.giphy.com/media/UTXH5YjqIOzihAP4Ee/200.webp?cid=ecf05e47fpg1lfilan6c2km8jiofo36vbi3rr81w5pw4nrs2&ep=v1_gifs_search&rid=200.webp&ct=g',
          'https://www.themarysue.com/wp-content/uploads/2015/08/sokka-gif.gif?fit=500%2C369',
          'https://animatedmeta.files.wordpress.com/2015/03/atla-flower-crowns.gif',
          'https://animatedmeta.files.wordpress.com/2015/03/atla-katara-season-3.gif',
          'https://media1.giphy.com/media/LMDlhWVmIVZM60PMlc/200.webp?cid=ecf05e47bllr8vtm9t3cz39a1oixa6fgmq3a8ba1ica8jz41&ep=v1_gifs_search&rid=200.webp&ct=g',
        ],
        card_colors: [
          '#d8f3dc',
          '#b7e4c7',
          '#95d5b2',
          '#74c69d',
          '#52b788',
          '#8a9a5b',
          '#b7e4c7',
          '#95d5b2',
          '#74c69d',
          '#52b788',
          '#d8f3dc',
          '#b7e4c7',
        ],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://media3.giphy.com/media/273fZpQzB8Kxq/giphy.webp?cid=ecf05e47pn9rfh8lffsophbsvdjnk1bl84mwg9k5jm01rf25&ep=v1_gifs_search&rid=giphy.webp&ct=g',
    },
    {
      color: 'black',
      score: 4340,
      title: 'HellYeahCore by Ethan',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#101010',
          'background-1': '#121212',
          'background-2': '#1a1a1a',
          borders: '#272727',
          links: '#969696',
          sidebar: '#121212',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/14/09/33/1409336a3a6f7e19c1465016d22b35b6.jpg',
          'https://i.pinimg.com/564x/b6/88/a1/b688a1dcdb56f3476e3b9cabbad1697a.jpg',
          'https://i.pinimg.com/564x/08/8b/6e/088b6ed91690a892acc6c6d6ed2060b3.jpg',
          'https://i.pinimg.com/564x/f4/d8/3f/f4d83f3055f0af4bf783190fb8527518.jpg',
          'https://i.pinimg.com/564x/c7/8d/a7/c78da7861df114e834ab4ab323983317.jpg',
          'https://i.pinimg.com/564x/f5/6d/68/f56d6874680bfd3b067db137403b6a45.jpg',
          'https://i.pinimg.com/564x/9a/57/06/9a5706592edcacaa459f3ced732353ae.jpg',
        ],
        card_colors: [
          '#e7e6f7',
          '#e3d0d8',
          '#aea3b0',
          '#827081',
          '#c6d2ed',
          '#e7e6f7',
          '#e3d0d8',
          '#aea3b0',
          '#827081',
          '#c6d2ed',
          '#e7e6f7',
          '#e3d0d8',
          '#aea3b0',
          '#827081',
          '#c6d2ed',
          '#e7e6f7',
          '#e3d0d8',
        ],
        custom_font: { family: "'Rakkas'", link: 'Rakkas:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/b6/88/a1/b688a1dcdb56f3476e3b9cabbad1697a.jpg',
    },
    {
      color: 'lightgreen',
      score: 4440,
      title: 'Totoro by K',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f3f1ec',
          'background-1': '#f5f5f5',
          'background-2': '#c7cdd1',
          borders: '#777e72',
          links: '#4d5d53',
          sidebar: 'linear-gradient(#738678, #365e45)',
          'sidebar-text': '#fafafa',
          'text-0': '#344239',
          'text-1': '#4d5d53',
          'text-2': '#738678',
        },
        custom_cards: [
          'https://www.icegif.com/wp-content/uploads/studio-ghibli-icegif-10.gif',
          'https://images.gr-assets.com/hostedimages/1489104577ra/22185966.gif',
          'https://giffiles.alphacoders.com/145/14553.gif',
          'https://i.pinimg.com/originals/05/88/74/058874b82e5eaba631d9250e6c6b8c88.gif',
          'https://64.media.tumblr.com/61eef18fa1e69ad15e97ea1c00236243/93e5a36d93cb40c8-61/s540x810/89ef20fea77618a448f4b1cf5bb50f57c2ff4e00.gif',
        ],
        card_colors: ['#649a79', '#5e9474', '#588e6f', '#53896b', '#4d8366'],
        custom_font: { family: "'Comfortaa'", link: 'Comfortaa:wght@400;700' },
      },
      preview:
        'https://www.brightwalldarkroom.com/wp-content/uploads/2017/04/truechildrenscinema.png',
    },
    {
      color: 'gray',
      score: 2340,
      title: 'Tallyhall by Tree',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#3b3b3b',
          'background-1': '#1e1e1e',
          'background-2': '#262626',
          borders: '#3c3c3c',
          links: '#82e6e8',
          sidebar:
            'linear-gradient(#8c8c8cc7, #808080c7), center url("https://preview.redd.it/behold-the-evolution-of-marvins-marvelous-mechanical-museum-v0-do4an5knkh4b1.jpg?width=640&crop=smart&auto=webp&s=afac923bf9f2d8e78388cc892d9c93102379c18f")',
          'sidebar-text': '#fefbfb',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.imgur.com/O4y0ZnL.png',
          'https://i.imgur.com/9t7wVX6.png',
          'https://i.imgur.com/Mm6LiJn.png',
          'https://i.imgur.com/OgFsKKx.png',
          'https://i.imgur.com/jEO9rEc.png',
          'https://i.imgur.com/lZgJ0DP.png',
          'https://i.imgur.com/TUX5k9H.png',
          'https://i.imgur.com/nqKoQcV.png',
          'https://i.imgur.com/Bf0Y0YA.png',
        ],
        card_colors: [
          '#ff2717',
          '#009606',
          '#d97900',
          '#cccccc',
          '#808080',
          '#4554a4',
          '#ffdf00',
          '#fcfbfc',
          '#8d9900',
        ],
        custom_font: { family: "'Barlow'", link: 'Barlow:wght@400;700' },
      },
      preview: 'https://i.imgur.com/lZgJ0DP.png',
    },
    {
      color: 'lightblue',
      score: 3420,
      title: 'Cinderella by Ashlynn',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e5f1ff',
          'background-1': '#5f95bf',
          'background-2': '#1a3247',
          borders: '#173e63',
          links: '#216a83',
          sidebar: 'linear-gradient(#d1ebff, #1a7ebc)',
          'sidebar-text': '#f5f5f5',
          'text-0': '#0f486b',
          'text-1': '#006894',
          'text-2': '#4071a5',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/74/65/0a/74650af76ea923a2109e82fb081c9661.gif',
          'https://i.pinimg.com/originals/b2/49/5f/b2495f809c528a1134e0c0951cc4a1d1.gif',
          'https://i.pinimg.com/originals/7d/e6/8a/7de68ae2951bfc4fa8c13ccafefff940.gif',
          'https://i.pinimg.com/originals/44/37/3c/44373c98c096d247d1624894a58f0c24.gif',
          'https://i.pinimg.com/originals/94/80/d0/9480d0543d04cfe7ba725ccf1d4d8916.gif',
          'https://i.pinimg.com/originals/16/1e/70/161e70b0d8ed7265e0103de974d96e5d.gif',
          'https://i.pinimg.com/originals/f3/8d/ec/f38dec23263f60a5320888b1b98ef60c.gif',
          'https://i.pinimg.com/originals/0e/6c/2e/0e6c2e55c157dfe6e1e2e3d2f4ffc229.gif',
          'https://i.pinimg.com/originals/3d/27/de/3d27de0c3e038982dd32ddd58d82cfdb.gif',
          'https://i.pinimg.com/originals/f6/42/a9/f642a9a5b5bce7a31650c7e3097381cb.gif',
        ],
        card_colors: ['#1a7ebc'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://compote.slate.com/images/d5aac540-31b8-4a00-a87b-ff1bb47b61b3.jpg',
    },
    {
      color: 'beige',
      score: 4340,
      title: 'Calvin&Hobbes by Micah',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fbe9e9',
          'background-1': '#fbe9e9',
          'background-2': '#fbe9e9',
          borders: '#b08f7d',
          links: '#363636',
          sidebar: '#b8a7be',
          'sidebar-text': '#000000',
          'text-0': '#575757',
          'text-1': '#404040',
          'text-2': '#b08f7d',
        },
        custom_cards: [
          'https://static1.cbrimages.com/wordpress/wp-content/uploads/2023/07/calvin-and-hobbes-childhood-summer-feature-image-1.jpg',
          'https://news.artnet.com/app/news-upload/2015/01/CalvinHobbes1.jpg',
          'https://cdn.vox-cdn.com/thumbor/JMJJ6yOitka0dI9cMNh8VJkRjHI=/0x0:1766x567/1200x800/filters:focal(992x178:1274x460)/cdn.vox-cdn.com/uploads/chorus_image/image/71979108/CH_reading.0.jpg',
          'https://stilllifewithgirl.files.wordpress.com/2012/01/calvinhobbes.jpg',
          'https://i.insider.com/564cc42e2491f99d008b63b7?width=1136&format=jpeg',
        ],
        card_colors: ['#70d6ff', '#ff70a6', '#ff9770', '#ffd670', '#e9ff70'],
        custom_font: { family: "'Jost'", link: 'Jost:wght@400;700' },
      },
      preview:
        'https://news.artnet.com/app/news-upload/2015/01/CalvinHobbes1.jpg',
    },
    {
      color: 'purple',
      score: 3320,
      title: 'Amongus by Hoang',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#2a004d',
          'background-1': '#61005e',
          'background-2': '#381849',
          borders: '#6e0c66',
          links: '#ffffff',
          sidebar: '#4c0c6e',
          'sidebar-text': '#c800d6',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://upload.wikimedia.org/wikipedia/en/9/9a/Among_Us_cover_art.jpg',
          'https://play-lh.googleusercontent.com/8ddL1kuoNUB5vUvgDVjYY3_6HwQcrg1K2fd_R8soD-e2QYj8fT9cfhfh3G0hnSruLKec',
          'https://kenh14cdn.com/thumb_w/660/2020/9/24/photo-2-1600965931818787105758.jpg',
        ],
        card_colors: ['#7a00b3'],
        custom_font: { family: "'Poppins'", link: 'Poppins:wght@400;700' },
      },
      preview:
        'https://play-lh.googleusercontent.com/8ddL1kuoNUB5vUvgDVjYY3_6HwQcrg1K2fd_R8soD-e2QYj8fT9cfhfh3G0hnSruLKec',
    },
    {
      color: 'beige',
      score: 4340,
      title: 'Neapolitan by Jahaira',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fff8f0',
          'background-1': '#e8ccb5',
          'background-2': '#fee1e1',
          borders: '#b48e7e',
          links: '#ffcccc',
          sidebar: '#f0d6d6',
          'sidebar-text': '#704c2e',
          'text-0': '#472610',
          'text-1': '#481d0f',
          'text-2': '#ffcccc',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/6a/e9/a3/6ae9a3966138e2fbe6c8afdaef3c18b6.jpg',
          'https://i.pinimg.com/564x/90/28/5f/90285ff3364ab0af1c44f3e0656236d1.jpg',
          'https://i.pinimg.com/564x/b2/54/cb/b254cb1e53da47ee1bd231341253be33.jpg',
          'https://i.pinimg.com/564x/62/89/b2/6289b2b9aacf6e4a5051645f037f7f5e.jpg',
          'https://i.pinimg.com/564x/28/3f/11/283f1120dc9f2932834f0fc5be5bc180.jpg',
          'https://i.pinimg.com/564x/fb/a6/12/fba612d6bc1a385d557c7d9cf4cb9b4d.jpg',
          'https://i.pinimg.com/564x/31/8a/ec/318aec5ae5b2787192cbf8b4f5f2c849.jpg',
          'https://i.pinimg.com/564x/11/a7/c4/11a7c4c0d45445ae21d7c35acc0896dc.jpg',
          'https://i.pinimg.com/564x/8a/9f/db/8a9fdb452f5159b304e05fcedfe6a967.jpg',
          'https://i.pinimg.com/564x/d3/bf/a6/d3bfa6956eb4339b9d389dea91aabd4d.jpg',
        ],
        card_colors: [
          '#dbb3a0',
          '#ebc3c3',
          '#997e6e',
          '#ffd8cf',
          '#995f72',
          '#fa84a0',
        ],
        custom_font: {
          family: "'Inconsolata'",
          link: 'Inconsolata:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/b2/54/cb/b254cb1e53da47ee1bd231341253be33.jpg',
    },
    {
      color: 'lightblue',
      score: 4440,
      title: 'Ravenclaw by Hannah',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#adb7db',
          'background-1': '#838caf',
          'background-2': '#838caf',
          borders: '#080821',
          links: '#121131',
          sidebar: '#838caf',
          'sidebar-text': '#080821',
          'text-0': '#080821',
          'text-1': '#080821',
          'text-2': '#242461',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/67/6e/24/676e24602e26a982c20580166fe57738.png',
          'https://i.pinimg.com/originals/27/aa/3c/27aa3cb01ca60f4dd4d1746f3521cb1e.jpg',
          'https://static.wikia.nocookie.net/ff11be42-79b0-4b2d-8cde-7726f7efdce6/scale-to-width/755',
          'https://static.wikia.nocookie.net/2a1f78f2-82b3-487c-af54-f106cf37190a/scale-to-width/755',
          'https://64.media.tumblr.com/9098428c644b6771c3f7d3411b46a860/tumblr_plb3wfZXj41s7jvre_400.jpg',
          'https://i.pinimg.com/236x/d2/f9/40/d2f9405b6de23d3d18e3468f74b7ff04.jpg',
          'https://pbs.twimg.com/media/D13XBNnX4AAXrhq.jpg',
          'https://pbs.twimg.com/media/EnXJIjlWEAYt1YV.jpg',
          'https://chasingdaisiesblog.com/wp-content/uploads/2020/12/934c124209766a9a69182f8482bfd79b-300x500.jpg',
          'https://78.media.tumblr.com/6238d229c272e417bb2447060a3c38dc/tumblr_ouo5q8MzOt1wx5fjeo1_500.png',
          'https://i.pinimg.com/564x/38/b1/63/38b16335f2d9e9eb789fa802e243e225.jpg',
          'https://i.pinimg.com/474x/8a/76/5a/8a765ae11cfb0749f9c0e0a9fab35582.jpg',
        ],
        card_colors: [
          '#515af0',
          '#4c53e1',
          '#474cd3',
          '#4245c4',
          '#3c3eb5',
          '#3737a7',
          '#323098',
          '#2d2989',
          '#27227b',
          '#221b6c',
          '#1d145d',
          '#180d4f',
          '#515af0',
        ],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://64.media.tumblr.com/9098428c644b6771c3f7d3411b46a860/tumblr_plb3wfZXj41s7jvre_400.jpg',
    },
    {
      color: 'white',
      score: 3320,
      title: 'SadHamster by Madison',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#ffe0ed',
          'background-2': '#ff0066',
          borders: '#ff007b',
          links: '#ff0088',
          sidebar: '#f490b3',
          'sidebar-text': '#ffffff',
          'text-0': '#ff0095',
          'text-1': '#ff8f8f',
          'text-2': '#ff5c5c',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/23/75/8a/23758a7cd23ba232a43f56b16efb5289.jpg',
        ],
        card_colors: [
          '#fbd4ea',
          '#fbcee8',
          '#fbc8e5',
          '#fcc2e3',
          '#fcbce0',
          '#fcb6de',
          '#fcb0db',
          '#fdaad9',
        ],
        custom_font: {
          family: "'Happy Monkey'",
          link: 'Happy+Monkey:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/originals/23/75/8a/23758a7cd23ba232a43f56b16efb5289.jpg',
    },
    {
      color: 'blue',
      score: 4320,
      title: 'Twilight by Gian',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#14181d',
          'background-1': '#1a2026',
          'background-2': '#212930',
          borders: '#2e3943',
          links: '#56Caf0',
          sidebar:
            'linear-gradient(#2e3943c7, #2e3943c7), center url("https://i.redd.it/42imxrg029t61.jpg")',
          'sidebar-text': '#049fbe',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://media1.tenor.com/m/GpYKlcOO7g8AAAAC/edward-cullen-twilight.gif',
          'https://waywardpiggy.files.wordpress.com/2020/09/twi-edward-and-bella-in-water.gif',
          'https://media.giphy.com/media/l41Yy7peNVGqSa5O0/giphy.gif?cid=790b7611nzqkbm6em56ec3i46xxroiv934d0gxu5ta620cmg&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.tenor.com/B4zNJfxJGA8AAAAM/cover-nose-edward-cullen.gif',
          'https://64.media.tumblr.com/a79a4ed92daed8a5d33e3d52d61383b3/35ed0d353f7318e2-87/s400x600/e4c30b1db45a9353089e2537a95ba652b978b4a1.gifv',
        ],
        card_colors: ['#284057', '#3e589b', '#3f626f', '#2c4c58', '#2d3e3f'],
        custom_font: {
          family: "'Baskervville'",
          link: 'Baskervville:wght@400;700',
        },
      },
      preview:
        'https://64.media.tumblr.com/a79a4ed92daed8a5d33e3d52d61383b3/35ed0d353f7318e2-87/s400x600/e4c30b1db45a9353089e2537a95ba652b978b4a1.gifv',
    },
    {
      color: 'white',
      score: 4430,
      title: 'Coquette by Angela',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fff9f0',
          'background-1': '#f9f5e3',
          'background-2': '#ef798a',
          borders: '#ffe5ee',
          links: '#ff5c5c',
          sidebar: '#ef798a',
          'sidebar-text': '#ffffff',
          'text-0': '#1d1e1',
          'text-1': '#ff8f8f',
          'text-2': '#ff5c5c',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/fb/29/a7/fb29a732c187f9b8cc41fd0f7d10b3d2.jpg',
          'https://i.pinimg.com/564x/38/46/c7/3846c7a282bf0c8413afb20f5e420964.jpg',
          'https://i.pinimg.com/564x/11/36/14/113614d3ae8116c08b61417985d36f71.jpg',
          'https://i.pinimg.com/564x/af/cf/cb/afcfcbccb4640a5197214da7858baec7.jpg',
          'https://i.pinimg.com/564x/bd/5b/af/bd5baf54ed2350009885c4fbfbd52bc3.jpg',
          'https://i.pinimg.com/564x/15/93/86/1593869674cca905e3fddcc36d9349ea.jpg',
          'https://i.pinimg.com/564x/3d/27/10/3d271068d396f49cb1a5f370d475f7c5.jpg',
          'https://i.pinimg.com/564x/67/85/6b/67856b3714671541c080dfe703b4397f.jpg',
          'https://i.pinimg.com/564x/28/ef/b8/28efb84cb3194a8d5e8952f7819bfd29.jpg',
        ],
        card_colors: [
          '#eaac8b',
          '#e56b6f',
          '#b56576',
          '#6d597a',
          '#355070',
          '#eaac8b',
          '#e56b6f',
          '#b56576',
          '#6d597a',
          '#355070',
          '#eaac8b',
          '#e56b6f',
        ],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://i.pinimg.com/564x/28/ef/b8/28efb84cb3194a8d5e8952f7819bfd29.jpg',
    },
    {
      color: 'blue',
      score: 4340,
      title: 'BlueStars by Payton',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0E3561',
          'background-1': '#516EE3',
          'background-2': '#4A63CA',
          borders: '#5C7BE5',
          links: '#A1B3EC',
          sidebar: 'linear-gradient(#000000, #071653)',
          'sidebar-text': '#ffffff',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#fff',
        },
        custom_cards: [
          'https://hips.hearstapps.com/hmg-prod/images/adobestock-397996532-64cd2eec9ca49.jpeg?crop=1xw:1xh;center,top&resize=1200:*',
          'https://s.yimg.com/ny/api/res/1.2/dfPV1nd.Yn077SdajiQiHw--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEwMDA7aD01NjM-/https://media.zenfs.com/en_US/News/BGR_News/planet-earth.jpg',
          'https://www.popsci.com/uploads/2019/12/20/VC6OKOFVRZAN7GUN4KUEHAAOMU.jpg?auto=webp&width=1440&height=810',
          'https://wallpapercave.com/wp/wp7398741.jpg',
          'https://i.ytimg.com/vi/CZNNfFcwsLQ/maxresdefault.jpg',
          'https://www.treehugger.com/thmb/FDT4RYkxU-lUwBAM9HvquJXeVAo=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/__opt__aboutcom__coeus__resources__content_migration__mnn__images__2019__07__shutterstock_113278297-247408febef145a5a6f04eeff17e85f4.jpg',
        ],
        card_colors: [
          '#41b5f3',
          '#90e0ef',
          '#000080',
          '#1770ab',
          '#71a3f6',
          '#41b5f3',
          '#24456a',
          '#24456a',
          '#71a3f6',
        ],
        custom_font: {
          family: "'Montserrat'",
          link: 'Montserrat:wght@400;700',
        },
      },
      preview:
        'https://s.yimg.com/ny/api/res/1.2/dfPV1nd.Yn077SdajiQiHw--/YXBwaWQ9aGlnaGxhbmRlcjt3PTEwMDA7aD01NjM-/https://media.zenfs.com/en_US/News/BGR_News/planet-earth.jpg',
    },
    {
      color: 'white',
      score: 4430,
      title: 'Tangled by Beanie',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#bf88b5',
          'background-2': '#984c9e',
          borders: '#9a518b',
          links: '#c8a8cd',
          sidebar: '#b687c0',
          'sidebar-text': '#f5f5f5',
          'text-0': '#724069',
          'text-1': '#8d497f',
          'text-2': '#9a40a0',
        },
        custom_cards: [
          'https://media.giphy.com/media/14yKLGG9MpIrK0/giphy.gif?cid=790b76117sgzcwfsan9n5juzd4gn0xd4ebfwx5e6pfiowc12&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/969ANhdEnVduw/giphy.gif?cid=790b76117sgzcwfsan9n5juzd4gn0xd4ebfwx5e6pfiowc12&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3NnemN3ZnNhbjluNWp1emQ0Z24weGQ0ZWJmd3g1ZTZwZmlvd2MxMiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/10vZ5EnSX4R8nm/giphy.gif',
          'https://media.giphy.com/media/14rbfgZ6aTgwAo/giphy.gif?cid=790b76117sgzcwfsan9n5juzd4gn0xd4ebfwx5e6pfiowc12&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/dGDkLNX9dofYc/giphy.gif?cid=790b76117sgzcwfsan9n5juzd4gn0xd4ebfwx5e6pfiowc12&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/haHHrnGj5aFjy/giphy.gif?cid=790b76117sgzcwfsan9n5juzd4gn0xd4ebfwx5e6pfiowc12&ep=v1_gifs_search&rid=giphy.gif&ct=g',
        ],
        card_colors: ['#c8a8cd'],
        custom_font: {
          family: "'Montserrat'",
          link: 'Montserrat:wght@400;700',
        },
      },
      preview:
        'https://media.giphy.com/media/dGDkLNX9dofYc/giphy.gif?cid=790b76117sgzcwfsan9n5juzd4gn0xd4ebfwx5e6pfiowc12&ep=v1_gifs_search&rid=giphy.gif&ct=g',
    },
    {
      color: 'gray',
      score: 4440,
      title: 'CAS by Ashly',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#303030',
          'background-1': '#212121',
          'background-2': '#303030',
          borders: '#212121',
          links: '#f5f5f5',
          sidebar:
            'linear-gradient(#000000c7, #303030c7), center url("https://i.pinimg.com/564x/3d/aa/43/3daa433a503fbd2439802f392a148a87.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/45/08/fc/4508fc9900cf47b8245e862d52fa528d.jpg',
          'https://i.pinimg.com/564x/21/79/12/217912236426b534769ffd20bb167d61.jpg',
          'https://i.pinimg.com/564x/18/5d/6f/185d6f015faf9aabf3afe733033d4ff1.jpg',
          'https://i.pinimg.com/564x/1e/6d/de/1e6dded470bf3ede51b9ceb9ab9d44e6.jpg',
          'https://i.pinimg.com/564x/da/88/d7/da88d721ab4abdf8d389585456264300.jpg',
          'https://i.pinimg.com/564x/28/5b/1b/285b1b22bacb93f71a832afde3cafbf1.jpg',
          'https://i.pinimg.com/564x/3f/07/b9/3f07b9e0cc49052fc92c90dde8c3dd23.jpg',
          'https://i.pinimg.com/564x/3d/24/ba/3d24baab6961ca6b18e021fd7c12dca9.jpg',
          'https://i.pinimg.com/564x/3f/07/b9/3f07b9e0cc49052fc92c90dde8c3dd23.jpg',
          'https://i.pinimg.com/564x/1e/11/e8/1e11e8f22cd71bd3e487cc23f0d811b4.jpg',
          'https://i.pinimg.com/564x/67/b5/5a/67b55aeb712c4e9109e545e38c3c482d.jpg',
          'https://i.pinimg.com/564x/b6/a6/ee/b6a6ee6c2ca19b66ea9cdf89cb86fec9.jpg',
        ],
        card_colors: ['#636363'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://i.pinimg.com/564x/3d/aa/43/3daa433a503fbd2439802f392a148a87.jpg',
    },
    {
      color: 'white',
      score: 4440,
      title: 'Luffy by babajmobile',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#f5f5f5',
          'background-2': '#d4d4d4',
          borders: '#984839',
          links: '#984839',
          sidebar: '#984839',
          'sidebar-text': '#ffffff',
          'text-0': '#8f3c2d',
          'text-1': '#8f3c2d',
          'text-2': '#8f3c2d',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/d5/ef/a6/d5efa6eb4c5997a361433832caa86fa8.jpg',
          'https://i.pinimg.com/474x/72/10/f8/7210f8a2bb4ed1e236038f5f3c4231ce.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ0iecaZbgozH-49REmvZMPH_0LVsUh5VrpmA&s',
          'https://i.pinimg.com/474x/ab/86/6e/ab866ec78c745e726130c9cf00516c1a.jpg',
          'https://i.pinimg.com/564x/fe/86/39/fe86391661da9ba3af116ee37bea020f.jpg',
          'https://i.pinimg.com/564x/bb/36/c1/bb36c1c374c05d9a138f8a8d58b7b679.jpg',
          'https://i.pinimg.com/474x/de/d2/ab/ded2ab2721261c113c83cda8f0124a37.jpg',
          'https://i.pinimg.com/736x/50/9f/83/509f83b008fe9935edcf4441370a3ae7.jpg',
          'https://i.pinimg.com/564x/66/1c/50/661c50cceca3e01b39a8e4e1ca591c19.jpg',
          'https://i.pinimg.com/564x/57/f6/e9/57f6e9b230adba1bbf9f829128d52a79.jpg',
          'https://i.pinimg.com/474x/61/1f/7a/611f7a0ff26a3454c218c4fe790c177a.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7aOj4WU2s39XXIqhsgTiYiqEohqARzNUlKA&usqp=CAU',
          'https://i.pinimg.com/736x/67/83/e0/6783e06145413342e585da8b523c6be0.jpg',
          'https://i.pinimg.com/474x/72/a6/f0/72a6f0afa01b72aac6b35f8540049f6b.jpg',
          'https://i.pinimg.com/474x/ec/ab/0d/ecab0dc233c1bc2c01d8543459d6f096.jpg',
          'https://i.pinimg.com/564x/76/d7/4b/76d74b7126eacb73cd6b029e8dc96670.jpg',
          'https://i.pinimg.com/564x/61/b4/55/61b455afdf8c9c8f526725d759e7d6ff.jpg',
        ],
        card_colors: ['#bd3c14'],
        custom_font: { family: "'Quicksand'", link: 'Quicksand:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/474x/ec/ab/0d/ecab0dc233c1bc2c01d8543459d6f096.jpg',
    },
    {
      color: 'yellow',
      score: 1230,
      title: 'Genshin by Casey',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fff9e0',
          'background-1': '#fff5cc',
          'background-2': '#ffec9e',
          borders: '#ffe785',
          links: '#ebbc00',
          sidebar: '#feefb4',
          'sidebar-text': '#333333',
          'text-0': '#000000',
          'text-1': '#000000',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://64.media.tumblr.com/dae8fda264b02bfeb48840dcb48e187d/0355b233f1f2b9d8-fb/s500x750/e1affe6f4c0a04a4f29f563ff2c49f1c432a0e04.gifv',
          'https://64.media.tumblr.com/807d2b2233d898c96ebe2c7fd13b4447/7d90f6fa96735fd2-10/s540x810/ad3a726f0e1a1cabfa844b1240d02a44eabb4dc0.gifv',
          'https://i.pinimg.com/originals/19/2d/87/192d87afdb014d5baa0556d0ff23dd2a.gif',
          'https://media.tenor.com/sWrXz2zeEiEAAAAd/kaveh-kaveh-genshin.gif',
          'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/1bc372c2-e412-46d4-be0e-a6b2aaa50bbb/dgbtmx3-538cc94a-81bb-4092-984a-03a5dca1e455.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzFiYzM3MmMyLWU0MTItNDZkNC1iZTBlLWE2YjJhYWE1MGJiYlwvZGdidG14My01MzhjYzk0YS04MWJiLTQwOTItOTg0YS0wM2E1ZGNhMWU0NTUuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.4gE_itt4db2bBrML1nzGR9ZULBz5qGOlgoq6jcBH5GE',
          'https://upload-os-bbs.hoyolab.com/upload/2021/07/19/94957158/31c7ce82c43457e36b0e4c892db7cc4a_8179770966222100404.gif',
        ],
        card_colors: [
          '#945dc4',
          '#79aa13',
          '#6ca8e4',
          '#359697',
          '#ec4923',
          '#f9ce67',
        ],
        custom_font: { family: "'Nunito'", link: 'Nunito:wght@400;700' },
      },
      preview:
        'https://s.yimg.com/ny/api/res/1.2/ByuTWwZNy.tuR_lwhKv2aw--/YXBwaWQ9aGlnaGxhbmRlcjt3PTY0MDtoPTM2MA--/https://s.yimg.com/os/creatr-uploaded-images/2022-07/e4dacb60-0412-11ed-b5f7-03790dd7fa12',
    },
    {
      color: 'black',
      score: 4340,
      title: 'Bumblebee by Aidan',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#000000',
          borders: '#e9fa00',
          links: '#fff700',
          sidebar:
            'linear-gradient(#6a6d36c7, #000000c7), center url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRejLra1Vp3btmrpL4gSW-xLhDXIquiYhU_Kg&usqp=CAU")',
          'sidebar-text': '#eeff00',
          'text-0': '#e1ff00',
          'text-1': '#f6fa00',
          'text-2': '#eeff00',
        },
        custom_cards: [
          'https://m.media-amazon.com/images/I/51I3gJUuN6L._AC_.jpg',
          'https://cdn.mos.cms.futurecdn.net/qMWN9AsNbFWkZrfCfwtMvF.jpg',
          'https://static1.squarespace.com/static/51b3dc8ee4b051b96ceb10de/51ce6099e4b0d911b4489b79/597f7d21440243167ab2a59b/1557985597492/official-plot-details-revealed-for-the-bumblebee-movie-and-john-cena-joins-the-cast-social.jpg?format=1500w',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJ5ICWXxwG9hLUJOF9IBfIUUI9O5OtyDRIX9x5v8-dGtbTDpi7x_J4FTfo8Hd1DMlr_xo&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-Vmdn_sDKBzt3YNNaxNQWNbEe6hOidEeLgIyMjsBhoh8OkPAjeLuLRTq_qsE0tTYYxk0&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUFJq-CY3UvOHvJ4WNVk9VtMptlc37_OBMQ_ntOBsyxNXz9vJdfN5u_k_rQ-jLJSVQNEs&usqp=CAU',
          'https://i0.wp.com/movienooz.com/wp-content/uploads/2017/03/Bumblebee-Transformers-0.jpg?fit=1200%2C675&ssl=1',
          'https://static.wikia.nocookie.net/55784a45-cdf0-4b20-aa3e-d92028c0bfe3/scale-to-width/755',
        ],
        card_colors: ['#fff700'],
        custom_font: { family: "'Tektur'", link: 'Tektur:wght@400;700' },
      },
      preview: 'https://cdn.mos.cms.futurecdn.net/qMWN9AsNbFWkZrfCfwtMvF.jpg',
    },
    {
      color: 'red',
      score: 4340,
      title: 'Panda by Pepe',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#130301',
          'background-1': '#340909',
          'background-2': '#2b0303',
          borders: '#3b0707',
          links: '#791616',
          sidebar: '#2d100b',
          'sidebar-text': '#732121',
          'text-0': '#6e0707',
          'text-1': '#681818',
          'text-2': '#611a1a',
        },
        custom_cards: [
          'https://www.joelsartore.com/wp-content/uploads/stock/ANI058/ANI058-00043.jpg',
          'https://www.joelsartore.com/wp-content/uploads/stock/ANI058/ANI058-00046-1920x1277.jpg',
          'https://i.pinimg.com/originals/46/a4/b8/46a4b82ea673d390348309cb65e3b357.gif,https://www.joelsartore.com/wp-content/uploads/stock/ANI058/ANI058-00047-1920x1278.jpg',
          'https://www.joelsartore.com/wp-content/uploads/stock/ANI058/ANI058-00073.jpg',
          'https://www.joelsartore.com/wp-content/uploads/stock/ANI058/ANI058-00046-1920x1277.jpg',
          'https://www.joelsartore.com/wp-content/uploads/stock/ANI058/ANI058-00067.jpg',
          'https://www.joelsartore.com/wp-content/uploads/stock/ANI058/ANI058-00047.jpg',
        ],
        card_colors: ['#4d0a0a'],
        custom_font: {
          family: "'Nanum Myeongjo'",
          link: 'Nanum+Myeongjo:wght@400;700',
        },
      },
      preview:
        'https://www.freep.com/gcdn/-mm-/6a18bc512d9447eb39e6019ea5533227984d5059/c=69-0-803-734/local/-/media/2015/09/23/DetroitFreePress/DetroitFreePress/635786063852286700-red-panda-baby1.jpg',
    },
    {
      color: 'brown',
      score: 4220,
      title: 'RDR2 by ezzy',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#987a57',
          'background-1': '#b0645e',
          'background-2': '#d5be81',
          borders: '#7c0e0e',
          links: '#394134',
          sidebar: '#504134',
          'sidebar-text': '#fcfcfc',
          'text-0': '#ffffff',
          'text-1': '#d6d6d6',
          'text-2': '#adadad',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/86/44/25/86442583db05d163f5e360d890ca6a5b.jpg',
          'https://i.pinimg.com/originals/d1/46/b6/d146b61abd2c87d69d3751297c0732ed.jpg',
          'https://64.media.tumblr.com/74a9c57d3aefd07aa3f92325fa1dbe6d/3ae2230ede8f162b-5b/s1280x1920/b71b4479087bbee18e38456afa5a92ea00a34218.jpg',
          'https://i.ytimg.com/vi/sxb57iwIHXY/maxresdefault.jpg',
        ],
        card_colors: ['#e01e37', '#c71f37', '#b21e35', '#a11d33'],
        custom_font: { family: "'Oswald'", link: 'Oswald:wght@400;700' },
      },
      preview: 'https://i.ytimg.com/vi/sxb57iwIHXY/maxresdefault.jpg',
    },
    {
      color: 'white',
      score: 4440,
      title: 'elegance by jenneyLL',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f7f7f7',
          'background-1': '#d6d6d6',
          'background-2': '#d4d4d4',
          borders: '#c7cdd1',
          links: '#424242',
          sidebar: '#000000',
          'sidebar-text': '#ffffff',
          'text-0': '#000000',
          'text-1': '#424242',
          'text-2': '#616161',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/f8/61/4a/f8614ae2e51efa0bed06558223890cec.jpg',
          'https://i.pinimg.com/736x/46/1e/a0/461ea052c0c0931c9d11c2fb2ae3facc.jpg',
          'https://i.pinimg.com/474x/9e/9c/df/9e9cdf28a2daf019c0c4e3ec7c90bde3.jpg',
          'https://i.pinimg.com/474x/2b/41/fd/2b41fd538091d8da5a13c999f51220b0.jpg',
          'https://i.pinimg.com/474x/03/a0/29/03a029741cd469f511c93b36875d9d71.jpg',
        ],
        card_colors: ['#424242'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://i.pinimg.com/474x/03/a0/29/03a029741cd469f511c93b36875d9d71.jpg',
    },
    {
      color: 'purple',
      score: 3440,
      title: 'Witches by noiahh',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#3c2a38',
          'background-1': '#856693',
          'background-2': '#8a6a8a',
          borders: '#81657b',
          links: '#dba4be',
          sidebar:
            'linear-gradient(#856639c7, #856693c7), center url("https://pbs.twimg.com/media/GH1EFmgb0AA_GZh?format=jpg&name=small")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#ddb6db',
          'text-1': '#c78faf',
          'text-2': '#392232',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/00/19/ae/0019aeca5034125084549c015ef27616.jpg',
          'https://i.pinimg.com/236x/ea/fb/fd/eafbfd7b8227eda49661e4358947417c.jpg',
          'https://i.pinimg.com/564x/9b/1e/3c/9b1e3c7e377efa057e42a16fd60f35d6.jpg',
          'https://i.pinimg.com/236x/a9/3d/7e/a93d7edb7a2365969aa2227734219263.jpg',
          'https://i.pinimg.com/564x/f5/1f/bf/f51fbf4a5498be82bc8ec5c931a38135.jpg',
          'https://i.pinimg.com/236x/2a/1c/c1/2a1cc16be3cc7058ac847496003333f7.jpg',
          'https://i.pinimg.com/564x/73/88/94/738894aefb630b4348445adf247d772f.jpg',
          'https://pbs.twimg.com/media/GEnYPIhXsAEzFFP?format=jpg&name=small',
          'https://i.pinimg.com/236x/eb/7e/b6/eb7eb638c9b269f967c5c7317abfd8e1.jpg',
          'https://cdnb.artstation.com/p/assets/images/images/069/598/815/large/mengxuan-li-f-lc2hkamaa9nee.jpg?1700534857',
          'https://cdnb.artstation.com/p/assets/images/images/065/953/609/large/mengxuan-li-under-the-tree.jpg?1691648968',
          'https://cdnb.artstation.com/p/assets/images/images/069/598/817/large/mengxuan-li-f-vgtiaawaasbhz-1.jpg?1700535026',
          'https://cdnb.artstation.com/p/assets/images/images/070/375/327/large/mengxuan-li-2.jpg?1702393155',
        ],
        card_colors: [
          '#eaac8b',
          '#e56b6f',
          '#b56576',
          '#6d597a',
          '#355070',
          '#eaac8b',
          '#e56b6f',
          '#b56576',
          '#6d597a',
          '#355070',
          '#eaac8b',
          '#e56b6f',
          '#b56576',
        ],
        custom_font: { family: "'Noto Sans'", link: 'Noto+Sans:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/236x/a9/3d/7e/a93d7edb7a2365969aa2227734219263.jpg',
    },
    {
      color: 'blue',
      score: 4330,
      title: 'Batman by Mireya',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#2b385f',
          'background-1': '#000129',
          'background-2': '#ffeb66',
          borders: '#9ecdff',
          links: '#ffffff',
          sidebar: '#e0f000',
          'sidebar-text': '#010902',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://images8.alphacoders.com/129/thumb-1920-1297431.jpg',
          'https://oxfordcomicsandgames.com/cdn/shop/products/202212-0000407954.jpg?v=1684771921',
          'https://i.kinja-img.com/image/upload/c_fit,q_60,w_1315/whufp9n1hgppnmckn2pk.jpg',
          'https://i.pinimg.com/736x/60/05/8b/60058b9024af588d0df1c2be6e1705aa.jpg',
          'https://wonderberryscomics.com/cdn/shop/products/202206-0000388041.jpg?v=1664220330',
          'https://preview.redd.it/artwork-damian-wayne-fans-what-do-you-hope-dc-does-with-the-v0-vs97ifh6n3ba1.jpg?width=640&crop=smart&auto=webp&s=8b9a2fb5403aca0693470435d3c26e39e45ae546',
          'https://m.media-amazon.com/images/M/MV5BYTA0NTViYjQtNWE4Yy00ZGFkLTg4ZWQtZTYwNGE3ZjhmOGEzXkEyXkFqcGdeQXVyMTE0MzQwMjgz._V1_QL75_UY281_CR31,0,500,281_.jpg',
        ],
        card_colors: [
          '#25171a',
          '#4b244a',
          '#533a7b',
          '#6969b3',
          '#7f86c6',
          '#25171a',
          '#4b244a',
        ],
        custom_font: { family: "'DM Sans'", link: 'DM+Sans:wght@400;700' },
      },
      preview:
        'https://i.kinja-img.com/image/upload/c_fit,q_60,w_1315/whufp9n1hgppnmckn2pk.jpg',
    },
    {
      color: 'purple',
      score: 4440,
      title: 'Kuromi by Kyle',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e7b3ff',
          'background-1': '#e095ea',
          'background-2': '#e6bff2',
          borders: '#bc6fd8',
          links: '#ffffff',
          sidebar:
            'linear-gradient(#f2abecc7, #b856abc7), center url("https://www.icegif.com/wp-content/uploads/2023/12/icegif-540.gif")',
          'sidebar-text': '#7518a0',
          'text-0': '#621287',
          'text-1': '#b04fad',
          'text-2': '#c77ad6',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/90/df/66/90df6664fb0bf88a11fec12e34caf53d.gif',
          'https://i.pinimg.com/originals/bc/59/15/bc5915d9e2b7e43e6531cc6a81cbef4d.gif',
          'https://i.pinimg.com/originals/8d/88/5b/8d885b2fcf30e8a69fab60d5cb5793be.gif',
          'https://i.pinimg.com/originals/24/32/af/2432af8bdde18c88f4d7037a162d22eb.gif',
          'https://i.pinimg.com/originals/b2/27/45/b22745df8a992673fd25e557e06439f4.gif',
        ],
        card_colors: ['#621287'],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/90/df/66/90df6664fb0bf88a11fec12e34caf53d.gif',
    },
    {
      color: 'green',
      score: 2230,
      title: 'Marvel by staypaged',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#102623',
          'background-1': '#204744',
          'background-2': '#35573c',
          borders: '#35573c',
          links: '#72a06f',
          sidebar: '#204744',
          'sidebar-text': '#9dd0d4',
          'text-0': '#9dd0d4',
          'text-1': '#fafcfb',
          'text-2': '#fafcfb',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/ed/7c/93/ed7c930b87be0ac9efa2ab964cec8ba0.gif',
          'https://media0.giphy.com/media/aUKJ2ZkoJ3INW/giphy.gif',
          'https://i.pinimg.com/originals/ed/6b/bb/ed6bbbda8829321675e13dfec0bd9a1f.gif',
          'https://i.pinimg.com/originals/43/38/3a/43383aef1ea78227f80125efb230a9db.gif',
          'https://64.media.tumblr.com/9dd6ead89993a43646793fc22a62adca/35a71135b7c6f379-d7/s500x750/c30a4057bfd7d1122bbea8e5a4e22789979b6d7c.gif',
          'https://64.media.tumblr.com/2714ae5df3f849dfd72c06192ad4c73b/tumblr_inline_phvuz6u06F1qm45md_500.gif',
          'https://64.media.tumblr.com/4db501f24b016322a4d2ac2cd92832c2/tumblr_nq81t7g48w1tj8oeco3_500.gif',
        ],
        card_colors: [
          '#023047',
          '#3a5e52',
          '#393941',
          '#743a2f',
          '#966926',
          '#927e5d',
          '#3f0d16',
        ],
        custom_font: { family: "'DM Sans'", link: 'DM+Sans:wght@400;700' },
      },
      preview: 'https://media0.giphy.com/media/aUKJ2ZkoJ3INW/giphy.gif',
    },
    {
      color: 'red',
      score: 4330,
      title: 'Shortcake by parmis',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#8d0b16',
          'background-1': '#757e35',
          'background-2': '#5b25ad',
          borders: '#fff94d',
          links: '#3ed33c',
          sidebar:
            'linear-gradient(#ff5c5cc7, #800000c7), center url("https://64.media.tumblr.com/268ed0e07899e4bb14da77e36f432b94/b4abf1043ec2b619-17/s640x960/e9bb1f6ff29656919f0a66be3d8f97f3f764efbc.jpg")',
          'sidebar-text': '#06931e',
          'text-0': '#cdff42',
          'text-1': '#abff2e',
          'text-2': '#94ffa0',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/15/90/3e/15903ee7e8b51ecd0e6113556eba161c.jpg',
          'https://i.pinimg.com/564x/49/24/38/492438fcb7db8a1b3ff31a22dedf46a8.jpg',
          'https://i.pinimg.com/564x/81/73/eb/8173eb11856d4fb5bf0d1e0b186162fc.jpg',
          'https://i.pinimg.com/564x/4e/a1/43/4ea14301f4c2ae2aae72c4c17e2c966a.jpg',
          'https://i.pinimg.com/564x/c6/cc/d1/c6ccd1a412a06605c7e4b0a14d8d4dff.jpg',
          'https://i.pinimg.com/564x/ff/7b/2d/ff7b2d91e945436ed8bfd8d47da11b33.jpg',
          'https://i.pinimg.com/564x/cc/bc/33/ccbc333de0a2a9d43a27aa69c63d741c.jpg',
          'https://i.pinimg.com/564x/ee/bf/ad/eebfadf0bc252444f509b932a94d8d53.jpg',
          'https://i.pinimg.com/564x/34/ee/b2/34eeb2787892ccd110e6601ca0554d3c.jpg',
          'https://i.pinimg.com/564x/b7/d3/44/b7d344ca4d6a2c526da5abad13666ae5.jpg',
          'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSqqF8QmWksSIJmkfmK-kqZWg0eO_mr7_3B9-7T9ypFNkBUc-QK',
        ],
        card_colors: [
          '#7ffe14',
          '#81fe13',
          '#83fe12',
          '#84fe10',
          '#86fe0f',
          '#88fe0e',
          '#89fe0c',
        ],
        custom_font: {
          family: "'Concert One'",
          link: 'Concert+One:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/ee/bf/ad/eebfadf0bc252444f509b932a94d8d53.jpg',
    },
    {
      color: 'red',
      score: 2120,
      title: 'Yadiermolina by bob',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e10e0e',
          'background-1': '#235ac7',
          'background-2': '#4669af',
          borders: '#454545',
          links: '#56Caf0',
          sidebar: '#eacb34',
          'sidebar-text': '#3e3cbe',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://res.cloudinary.com/ybmedia/image/upload/c_crop,h_1125,w_2000,x_0,y_70/c_fill,f_auto,h_1215,q_auto,w_2160/v1/m/6/5/65ac2866bb65e615b4c9efcdab4656e61818d24c/sep-15-2022-st-louis-missouri-usa-st-louis.jpg',
          'https://res.cloudinary.com/ybmedia/image/upload/c_crop,h_1333,w_2000,x_0,y_0/c_fill,f_auto,h_1200,q_auto,w_1200/v1/m/8/8/8881d39ad241fb731019bf2a3bf5f649f01f1080/yadier-molina-says-five-teams-shown-interest.jpg',
          'https://bdc2020.o0bc.com/wp-content/uploads/2017/07/812909756-768x432.jpg?width=900',
          'https://pbs.twimg.com/media/D6Y5XS-XoAAnNtL?format=jpg&name=large',
          'https://res.cloudinary.com/ybmedia/image/upload/c_crop,h_1125,w_2000,x_0,y_59/c_fill,f_auto,h_900,q_auto,w_1600/v1/m/b/b/bb2bfa3a47096bb6d52e5696738f15ea61432020/12693522.jpg',
          'https://bloximages.chicago2.vip.townnews.com/pantagraph.com/content/tncms/assets/v3/editorial/e/f6/ef6cb5d7-9b05-59be-ba68-a1bdfe6a8f62/607507527f836.image.jpg?resize=1200%2C844',
          'https://sportshub.cbsistatic.com/i/r/2022/09/29/e73fee06-db33-4dce-987a-76cf1f493b6a/thumbnail/770x433/682c4bca907b484aba1239dbe7bcaf16/yadi-pr-getty.png',
          'https://cdn.theathletic.com/app/uploads/2020/06/10003437/GettyImages-948867982-scaled.jpg',
        ],
        card_colors: ['#56Caf0'],
        custom_font: { family: "'Cinzel'", link: 'Cinzel:wght@400;700' },
      },
      preview:
        'https://res.cloudinary.com/ybmedia/image/upload/c_crop,h_1125,w_2000,x_0,y_59/c_fill,f_auto,h_900,q_auto,w_1600/v1/m/b/b/bb2bfa3a47096bb6d52e5696738f15ea61432020/12693522.jpg',
    },
    {
      color: 'gray',
      score: 3230,
      title: 'Nolan by MacKenzie',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#c9c9c9',
          'background-1': '#ffffff',
          'background-2': '#c9c9c9',
          borders: '#292929',
          links: '#ffffff',
          sidebar: '#292929',
          'sidebar-text': '#982525',
          'text-0': '#982525',
          'text-1': '#000000',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://media1.tenor.com/m/kiN0jiuNxG0AAAAC/spinning-top.gif',
          'https://media1.tenor.com/m/2TpicKLN95EAAAAd/interstellar-joseph-cooper.gif',
          'https://media1.tenor.com/m/bcOXw06JhO8AAAAC/tenet-hands.gif',
          'https://media1.tenor.com/m/ec4wj2i70M0AAAAC/spaceship-interstellar.gif',
          'https://media1.tenor.com/m/evaZ_xCxcCgAAAAd/the-dark-knight-batman.gif',
          'https://media1.tenor.com/m/4iLkGFOhY1sAAAAC/dark-knight-ending.gif',
        ],
        card_colors: ['#982525'],
        custom_font: {
          family: "'Inconsolata'",
          link: 'Inconsolata:wght@400;700',
        },
      },
      preview: 'https://media1.tenor.com/m/kiN0jiuNxG0AAAAC/spinning-top.gif',
    },
    {
      color: 'black',
      score: 1240,
      title: 'Roblox by Jaye',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#000000',
          borders: '#000000',
          links: '#c5c5c5',
          sidebar: '#000000',
          'sidebar-text': '#c5c5c5',
          'text-0': '#c5c5c5',
          'text-1': '#c5c5c5',
          'text-2': '#c5c5c5',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/8d/cd/b9/8dcdb90ffc2c8f3725ef81ea62001da5.jpg',
          'https://i.pinimg.com/736x/ea/64/38/ea64387f58b5394095f9b2f3a0e570bf.jpg',
          'https://i.pinimg.com/564x/5e/da/c1/5edac174877e00597dcb92d0c1237ac0.jpg',
          'https://i.pinimg.com/564x/50/99/10/5099103e89f42216cf032cbad3f099ca.jpg',
          'https://i.pinimg.com/564x/fe/c7/9a/fec79a0bb48ed65fb1e00e11f7cd3471.jpg',
          'https://i.pinimg.com/564x/33/9e/0b/339e0b23e409e0052d46e19e9fe071be.jpg',
          'https://i.pinimg.com/564x/ba/11/b2/ba11b298ffbdffcd6b01acb7dba10ccb.jpg',
          'https://i.pinimg.com/564x/49/1e/9b/491e9b8d414014999e8896bf614ba34e.jpg',
          'https://i.pinimg.com/736x/9a/92/f6/9a92f6164c1882cd46d558a61b19e276.jpg',
        ],
        card_colors: ['#c5c5c5'],
        custom_font: { family: "'Tektur'", link: 'Tektur:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/736x/ea/64/38/ea64387f58b5394095f9b2f3a0e570bf.jpg',
    },
    {
      color: 'beige',
      score: 4340,
      title: 'BeachBabe by Addi',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fff4e0',
          'background-1': '#c0a070',
          'background-2': '#aad5da',
          borders: '#7ec4d4',
          links: '#c0dede',
          sidebar: 'linear-gradient(#c0dede, #7ec4d4)',
          'sidebar-text': '#fff4e0',
          'text-0': '#957447',
          'text-1': '#c0a070',
          'text-2': '#957447',
        },
        custom_cards: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKLK5meGedcH25ZJkDFQVysys4l4gXL_uaQQ&usqp=CAU',
          'https://i.pinimg.com/236x/5e/e4/5f/5ee45fe946b16d26a902a1c2e4c9d00f.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKtoodx5WqI439WxvbSb1n0bpQnBSBfwZo3w&usqp=CAU',
          'https://i.pinimg.com/236x/4b/d6/a6/4bd6a6974777c6a1f299e12f982fb010.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRszoqgvZvAGxRhC6KbWM55jUm7x6LDeF9eKA&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyx40El2TT4btictQ0y02NUcrTr1Wi5wsOAc1qBd0M1RCq_N7paFOWyT4yV6An19qSTJ0&usqp=CAU',
          'https://i.pinimg.com/236x/5f/03/c5/5f03c53aac462b6f5eb843eeedc21a2a.jpg',
          'https://www.fabmood.com/wp-content/uploads/2023/05/summer-aesthetic-24.jpg',
          'https://i.pinimg.com/236x/ae/9d/b8/ae9db89ef3668a072b90bd4762723278.jpg',
          'https://i.pinimg.com/236x/9d/fd/7d/9dfd7d05db370ede383bcbec152377f9.jpg',
          'https://i.pinimg.com/236x/88/b0/13/88b013b4885b1674fc1f3134e3bf85b7.jpg',
        ],
        card_colors: [
          '#f7fbdd',
          '#eff8dd',
          '#e7f5dc',
          '#e0f2dc',
          '#d8efdc',
          '#d0eddb',
          '#c8eadb',
          '#c1e7db',
          '#b9e4da',
          '#b1e1da',
          '#aadfda',
        ],
        custom_font: {
          family: "'Happy Monkey'",
          link: 'Happy+Monkey:wght@400;700',
        },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSKtoodx5WqI439WxvbSb1n0bpQnBSBfwZo3w&usqp=CAU',
    },
    {
      color: 'brown',
      score: 3340,
      title: 'Ethel by Tabby',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#958e7e',
          'background-1': '#533704',
          'background-2': '#acc3f1',
          borders: '#533704',
          links: '#715650',
          sidebar: '#d4c09b',
          'sidebar-text': '#ffffff',
          'text-0': '#53410e',
          'text-1': '#ddd3b1',
          'text-2': '#473100',
        },
        custom_cards: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxxteG8YRXUKurlLzgXphWWL6LlxgnD6OoBQ&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ6deUGgt2L0V-dbRHgSQVurGJTxYnFRkbGZg&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSHtSkw1KFf7Tn22svs-SQrcx7ZCTp1h6mPfw&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSSbgPkynlxo1CwOmxvAkhEjccepARjezKlw&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ71NcOJuOi7GDoIm4oAHPQdI8BhCSo2KHDNA&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRWhRSWtt5N_uKsSeuWyDr-JWnEiXg71LXSFw&usqp=CAU',
        ],
        card_colors: [
          '#73706d',
          '#8d8880',
          '#a6a094',
          '#c0b8a7',
          '#d9d0ba',
          '#f3e9ce',
        ],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTSSbgPkynlxo1CwOmxvAkhEjccepARjezKlw&usqp=CAU',
    },
    {
      color: 'white',
      score: 4340,
      title: 'Aura by Joquel',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fffcfa',
          'background-1': '#354f52',
          'background-2': '#52796f',
          borders: '#f4d6dc',
          links: '#e8bac3',
          sidebar: '#f5cfd6',
          'sidebar-text': '#ffffff',
          'text-0': '#f5cfd6',
          'text-1': '#f5cfd6',
          'text-2': '#f5cfd6',
        },
        custom_cards: [
          'https://template.canva.com/EAE7h2ql-W4/1/0/800w-K65pgzyyBdg.jpg',
          'https://wallpapercave.com/wp/wp11394247.jpg',
          'https://w0.peakpx.com/wallpaper/62/943/HD-wallpaper-aura-aura-color-thumbnail.jpg',
          'https://mir-s3-cdn-cf.behance.net/projects/404/d8b71d138572163.Y3JvcCwzOTI3LDMwNzIsNzY4LDA.png',
        ],
        card_colors: ['#f5cfd6'],
        custom_font: { family: "'DM Sans'", link: 'DM+Sans:wght@400;700' },
      },
      preview:
        'https://w0.peakpx.com/wallpaper/62/943/HD-wallpaper-aura-aura-color-thumbnail.jpg',
    },
    {
      color: 'green',
      score: 3440,
      title: 'Spring by Jordan',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#696859',
          'background-1': '#69685a',
          'background-2': '#ffffff',
          borders: '#cccccc',
          links: '#cccccc',
          sidebar: '#838277',
          'sidebar-text': '#cccccc',
          'text-0': '#cccccc',
          'text-1': '#cccccc',
          'text-2': '#cccccc',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/f3/26/4f/f3264f8ba59e3dbbaeb27bf6273b2c2a.gif',
          'https://i.pinimg.com/originals/17/12/60/171260344810df023fcfd23e9300c275.gif',
          'https://i.pinimg.com/originals/bb/1d/8a/bb1d8a1f46ff4fd8605e1b78f0613ca8.gif',
          'https://i.pinimg.com/originals/62/4b/ed/624bed87a8772544ff3c30be5a19dbfa.gif',
          'https://i.pinimg.com/originals/90/aa/d6/90aad6c46a9bb5d5f148a4021b143688.gif',
          'https://i.pinimg.com/originals/2a/72/f4/2a72f4efd573af9e15f5558e7662b1c7.gif',
          'https://i.pinimg.com/originals/60/9f/b8/609fb89b55e763c43c6da1955c79d46f.gif',
          'https://i.pinimg.com/originals/98/51/f6/9851f6df081e8ad4d60056d1ed11dc46.gif',
          'https://i.pinimg.com/originals/56/6b/3e/566b3e2ed431b7ce6bc07bdd7c1be9f7.gif',
          'https://i.pinimg.com/originals/01/80/1d/01801ddcf48ce3e8d7ed165150099ce5.gif',
        ],
        card_colors: [
          '#e7e6f7',
          '#e3d0d8',
          '#aea3b0',
          '#827081',
          '#c6d2ed',
          '#e7e6f7',
          '#e3d0d8',
          '#aea3b0',
          '#827081',
          '#c6d2ed',
        ],
        custom_font: {
          family: "'Expletus Sans'",
          link: 'Expletus+Sans:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/originals/90/aa/d6/90aad6c46a9bb5d5f148a4021b143688.gif',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'Ornate by Sarah',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#dfced5',
          'background-1': '#f8edf1',
          'background-2': '#c3a888',
          borders: '#ffffff',
          links: '#827773',
          sidebar:
            'linear-gradient(#c09a8dc7, #d5c4cbc7), center url("https://i.pinimg.com/474x/c4/54/f3/c454f340fc3aadf58a47f29878196956.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#ac9477',
          'text-1': '#ac9477',
          'text-2': '#ac9477',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/bb/31/f9/bb31f99ced9ef86287117a9e2cac9e26.jpg',
          'https://i.pinimg.com/474x/d9/83/c7/d983c769ffe244cd438e7bc3438e56f4.jpg',
          'https://i.pinimg.com/474x/50/f8/19/50f819e106311374e5d9bc911529adb4.jpg',
          'https://i.pinimg.com/474x/76/7d/1e/767d1ee58ffdb33ffe9b59bd37c1c226.jpg',
          'https://i.pinimg.com/474x/bc/70/82/bc708283fa4309e36234e8f0569ed615.jpg',
          'https://i.pinimg.com/474x/f8/ff/22/f8ff2213b1b4073b5b09319e8bc1d634.jpg',
          'https://i.pinimg.com/474x/56/b7/ef/56b7ef0f2872f17133cfab7f26446948.jpg',
        ],
        card_colors: ['#827773'],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/474x/50/f8/19/50f819e106311374e5d9bc911529adb4.jpg',
    },
    {
      color: 'pink',
      score: 4340,
      title: 'Animegirls by sugar',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fff0f5',
          'background-1': '#ffc7dd',
          'background-2': '#ffc7dd',
          borders: '#ffc7dd',
          links: '#cc3e82',
          sidebar:
            'linear-gradient(#ffc7ddc7, #ffc7ddc7), url("https://i.pinimg.com/474x/f9/1f/ce/f91fced51498b3456b80312fdd953ce1.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#cf9191',
          'text-1': '#ff80bd',
          'text-2': '#ff80bd',
        },
        custom_cards: [
          'https://64.media.tumblr.com/b39aa06e8152334469e07a6df4329489/5304c1c1290ddcba-ed/s540x810/b23682cdfa758b2eb755ae6befc0e72e3e515524.gif',
          'https://64.media.tumblr.com/a92a1d41cf486281bdd02dcfe755e24d/tumblr_p8zhexzBb91x82plio1_540.gif',
          'https://pa1.aminoapps.com/6426/5de72a54c21b35d2e71b8d46ccff6cc5e248e63d_hq.gif',
          'https://64.media.tumblr.com/dee5c6e9ca561c1c3efb53ac749549f7/tumblr_p8qix63szE1x82plio1_540.gif',
          'https://64.media.tumblr.com/790ae7e1564c83cca2b34a46f0f2741b/fc1d646428331717-b0/s640x960/27adc2e5ea3b7222592ff45459564aca9826ec10.gif',
        ],
        card_colors: ['#ff80bd'],
        custom_font: {
          family: "'Silkscreen'",
          link: 'Silkscreen:wght@400;700',
        },
      },
      preview:
        'https://64.media.tumblr.com/b39aa06e8152334469e07a6df4329489/5304c1c1290ddcba-ed/s540x810/b23682cdfa758b2eb755ae6befc0e72e3e515524.gif',
    },
    {
      color: 'blue',
      score: 2240,
      title: 'ArcaneJinx by Paige',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#001845',
          'background-1': '#001845',
          'background-2': '#401c33',
          borders: '#732959',
          links: '#a63f8a',
          sidebar: '#30588c',
          'sidebar-text': '#ffffff',
          'text-0': '#ffffff',
          'text-1': '#ededed',
          'text-2': '#a5a5a5',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/98/39/65/983965f8a02dfe07bc1fa5d05f14158c.jpg',
          'https://i.pinimg.com/474x/01/61/02/0161023c3347e65edd5dac4ad06f3cf8.jpg',
          'https://i.pinimg.com/564x/a2/c4/8d/a2c48dac3436e0ee5718b8517abd6f39.jpg',
          'https://i.pinimg.com/564x/e5/a1/ee/e5a1eeb82e553745140a1f888a78c6f2.jpg',
          'https://i.pinimg.com/564x/1b/c8/45/1bc845ef5626dd0b5963a367fcbef6d1.jpg',
          'https://i.pinimg.com/564x/ff/db/41/ffdb4185ea569916be05096f29094774.jpg',
          'https://i.pinimg.com/564x/dd/93/59/dd9359b62e63257bfd919f2d8d4e502e.jpg',
        ],
        card_colors: ['#25171a', '#4b244a', '#533a7b', '#6969b3', '#7f86c6'],
        custom_font: {
          link: 'Montserrat:wght@400;700',
          family: "'Montserrat'",
        },
      },
      preview:
        'https://i.pinimg.com/474x/01/61/02/0161023c3347e65edd5dac4ad06f3cf8.jpg',
    },
    {
      color: 'blue',
      score: 3340,
      title: 'Starlight by isa',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#11111b',
          'background-1': '#181825',
          'background-2': '#1e1e2e',
          borders: '#4f5463',
          links: '#f5c2e7',
          sidebar: '#181825',
          'sidebar-text': '#7f849c',
          'text-0': '#cdd6f4',
          'text-1': '#7f849c',
          'text-2': '#a6e3a1',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/2a/b4/36/2ab43691be9a8f02ce9c4bac16829e04.jpg',
          'https://i.pinimg.com/236x/d1/e6/01/d1e6018ae110a6f512e0e1d04253b47d.jpg',
          'https://i.pinimg.com/564x/bb/87/60/bb8760381e062882c26b5095655a83c2.jpg',
          'https://i.pinimg.com/736x/3f/29/24/3f292410147443b061fdfe770631f2a4.jpg',
          'https://i.pinimg.com/736x/4a/2c/04/4a2c047043f9a703975d66fef6a08959.jpg',
        ],
        card_colors: ['#25171a', '#4b244a', '#533a7b', '#6969b3', '#7f86c6'],
        custom_font: {
          family: "'Roboto Mono'",
          link: 'Roboto+Mono:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/bb/87/60/bb8760381e062882c26b5095655a83c2.jpg',
    },
    {
      color: 'brown',
      score: 3340,
      title: 'Cottagecore by Feather',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#D6BEA8',
          'background-1': '#c5a98f',
          'background-2': '#638B21',
          borders: '#661C00',
          links: '#763c0f',
          sidebar: 'linear-gradient(#c5a98f, #763c0f)',
          'sidebar-text': '#f4d7a3',
          'text-0': '#53362B',
          'text-1': '#53362B',
          'text-2': '#53362B',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/01/d5/28/01d528d88a51c85a11bb8a30af450037.jpg',
          'https://i.pinimg.com/originals/a2/1d/a4/a21da48a4ee05a3ddf72f6b8b4f5e5d0.jpg',
          'https://i.pinimg.com/originals/2d/05/02/2d0502a7e641c4bc6a5ecc0345ddc0f6.jpg',
        ],
        card_colors: ['#af0000', '#9c0000', '#8a0000'],
        custom_font: { family: "'Rakkas'", link: 'Rakkas:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/2d/05/02/2d0502a7e641c4bc6a5ecc0345ddc0f6.jpg',
    },
    {
      color: 'brown',
      score: 4340,
      title: 'Beach by TenorToddler',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#5f574d',
          'background-1': '#625441',
          'background-2': '#404040',
          borders: '#454545',
          links: '#9b674a',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://c.tenor.com/JVdaeOMgiEEAAAAC/sea-beach.gif")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/92/ee/28/92ee287f187d3078a006a93c96d22564.jpg',
          'https://i.pinimg.com/236x/62/2e/c9/622ec9bfbacce9e082c1d069a4de0c49.jpg',
          'https://i.pinimg.com/236x/eb/f7/27/ebf7272c8a038d05fe5324a2a5d824b0.jpg',
          'https://i.pinimg.com/236x/fc/f5/42/fcf542e253ebaa4bfd0a2ce1a0c2e587.jpg',
          'https://i.pinimg.com/236x/55/2a/78/552a787cac5fc22627477cb302f104d4.jpg',
          'https://i.pinimg.com/236x/3b/47/79/3b47796baa25e21cf5fb294879d2aa60.jpg',
        ],
        card_colors: [
          '#a27f71',
          '#a68375',
          '#ae8b7e',
          '#b28f83',
          '#b69387',
          '#a27f71',
        ],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/236x/55/2a/78/552a787cac5fc22627477cb302f104d4.jpg',
    },
    {
      color: 'gray',
      score: 4430,
      title: 'Batman by Cang',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#828282',
          'background-1': '#595454',
          'background-2': '#000000',
          borders: '#f5f5f5',
          links: '#000000',
          sidebar: '#000000',
          'sidebar-text': '#adadad',
          'text-0': '#ffffff',
          'text-1': '#000000',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://media1.giphy.com/media/Q2tS8xloz0cg0/200w.gif?cid=6c09b95278t0whbpl00lnf9sfz1h31y9fp6mu0qgumjmqzwg&ep=v1_gifs_search&rid=200w.gif&ct=g',
          'https://media2.giphy.com/media/tsa1OggzHsc9O/giphy.gif?cid=6c09b952w968gqi4sdrmyc6uzm6lpvz42a3rrdby1c07n8fi&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=g',
          'https://www.icegif.com/wp-content/uploads/2023/07/icegif-1124.gif',
          'https://media0.giphy.com/media/ItCjeMCC34gZG/200w.gif?cid=6c09b952ycey879kmrad1hd86vbfbl3obj70h3o5klk0wx98&ep=v1_gifs_search&rid=200w.gif&ct=g',
          'https://media2.giphy.com/media/3xZkfFA9J0RJm/200w.gif?cid=6c09b9522fbdqn3h7yhrdpd35fwyxz3dx9nprjc3n44tin7q&ep=v1_gifs_search&rid=200w.gif&ct=g',
          'https://mir-s3-cdn-cf.behance.net/project_modules/max_632/4178e949665279.560862a568876.gif',
          'https://media2.giphy.com/media/B4jfJqiIxvU08/giphy.gif',
        ],
        card_colors: ['#000000'],
        custom_font: {
          family: "'Nanum Myeongjo'",
          link: 'Nanum+Myeongjo:wght@400;700',
        },
      },
      preview:
        'https://media0.giphy.com/media/ItCjeMCC34gZG/200w.gif?cid=6c09b952ycey879kmrad1hd86vbfbl3obj70h3o5klk0wx98&ep=v1_gifs_search&rid=200w.gif&ct=g',
    },
    {
      color: 'red',
      score: 4130,
      title: 'Marlboro by Jordan',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e22235',
          'background-1': '#ebc714',
          'background-2': '#ebc714',
          borders: '#ffffff',
          links: '#000000',
          sidebar: '#ffffff',
          'sidebar-text': '#000000',
          'text-0': '#000000',
          'text-1': '#000000',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://i.pinimg.com/1200x/32/74/48/3274484280e2916f609aa8d321de29b4.jpg',
          'https://i.pinimg.com/originals/10/69/46/106946745ff588d483221cdb197a1e94.jpg',
          'https://i.etsystatic.com/44694009/r/il/7125e5/5074264017/il_fullxfull.5074264017_c3ym.jpg',
          'https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2018%2F12%2Fmclaren-p1-gtr-ayrton-senna-marlboro-edition-1.jpg?cbr=1&q=90',
          'https://i.pinimg.com/originals/18/b8/a7/18b8a7fce5b30e5c62efb4f399986a2b.jpg',
          'https://i.redd.it/acjttq96nf481.jpg',
          'https://i.redd.it/5g3514zvw5f21.jpg',
          'https://i.pinimg.com/736x/19/e2/23/19e2231a5d232b8e1c9f60c7db76d513.jpg',
        ],
        card_colors: ['#4b7b80'],
        custom_font: {
          family: "'Expletus Sans'",
          link: 'Expletus+Sans:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/736x/19/e2/23/19e2231a5d232b8e1c9f60c7db76d513.jpg',
    },
    {
      color: 'beige',
      score: 2440,
      title: 'Catpocalypse by KReese',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#F0EAD6',
          'background-1': '#F0EAD6',
          'background-2': '#F0EAD6',
          borders: '#A37964',
          links: '#d65d26',
          sidebar:
            'linear-gradient(#90E4C1c7, #CBC3E3c7), center url("https://i.pinimg.com/736x/fa/f1/28/faf128ea96f86ecd91d918f3686b0650.jpg")',
          'sidebar-text': '#404040',
          'text-0': '#353535',
          'text-1': '#404040',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/01/2f/55/012f5579f69e46958d2adf08a6c1cf73.jpg',
          'https://i.pinimg.com/736x/2f/46/e9/2f46e9f151864c2883b55962dd0a5b5c.jpg',
          'https://i.pinimg.com/564x/2e/69/9a/2e699a42168ccb4f679e7e7d29424716.jpg',
          'https://i.pinimg.com/564x/1c/c2/10/1cc21076df4dab71f87a075dd694680f.jpg',
          'https://i.pinimg.com/564x/9a/c6/dd/9ac6ddc06a80722c1c4276f16d58e94c.jpg',
          'https://i.pinimg.com/736x/ff/62/26/ff6226dbbf6622b26819f44170576e3f.jpg',
        ],
        card_colors: [
          '#e3b505',
          '#95190c',
          '#610345',
          '#107e7d',
          '#044b7f',
          '#e3b505',
        ],
        custom_font: { family: "'DM Sans'", link: 'DM+Sans:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/1c/c2/10/1cc21076df4dab71f87a075dd694680f.jpg',
    },
    {
      color: 'lightgreen',
      score: 3440,
      title: 'Shortcake by Allison',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#d8f5c7',
          'background-1': '#d8f5c7',
          'background-2': '#d8f5c7',
          borders: '#84a98c',
          links: '#354f52',
          sidebar: '#84a98c',
          'sidebar-text': '#e2e8de',
          'text-0': '#354f52',
          'text-1': '#354f52',
          'text-2': '#354f52',
        },
        custom_cards: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQsCXZzD8NlKxIPgul9XV0m_rOayN_Lr1zhY5_uq5JeGrklhIFw13w3vSe0Et81WHh3ZWE&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQt3j23lu6PG12gc4x9rZeYbqJR6DnKGC5RS21YfSrE7w9pkCegM5rV4MHYsTBo4lUlTAA&usqp=CAU',
          'https://www.fivelittlediamonds.co.uk/cdn/shop/articles/7bbaa66a1fbdc9931c5c658373e0625c.jpg?v=1655214703',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM8VfOE9gPO-3qq4xRae8ph60gDttSmp5T1CM46jypexQwEg2pv0VbWemCxmFoXXJHfmk&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRscOf5ELIF31NfMVth8Jn4qcXCrbZk0mViSgMENZMCAnV94ROo5djvn8GcOsPI1GTsOfs&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOrn28TQlACtd8thH6lrfy0zT9b3_-YAoO0u_a7g7oQsRPI_bgObbnONJz0dTT4PRMBGs&usqp=CAU',
        ],
        card_colors: [
          '#e01e37',
          '#c71f37',
          '#b21e35',
          '#a11d33',
          '#6e1423',
          '#e01e37',
        ],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRscOf5ELIF31NfMVth8Jn4qcXCrbZk0mViSgMENZMCAnV94ROo5djvn8GcOsPI1GTsOfs&usqp=CAU',
    },
    {
      color: 'gray',
      score: 2320,
      title: 'TVD by Andrea',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#2f3e46',
          'background-1': '#354f52',
          'background-2': '#52796f',
          borders: '#84a98c',
          links: '#F9F6EE',
          sidebar: '#354f52',
          'sidebar-text': '#e2e8de',
          'text-0': '#e2e8de',
          'text-1': '#cad2c5',
          'text-2': '#adb1aa',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/a5/39/38/a539382cf35ce63e38a40fbc528c91f1.jpg',
          'https://i.pinimg.com/originals/c1/48/72/c1487282a9469066b170667fec50e22e.gif',
          'https://i.pinimg.com/originals/3f/82/28/3f822880524d0f560fb854f09aef68e5.gif',
          'https://i.pinimg.com/originals/6f/22/1b/6f221b109c5c0d7f5f3669bd8cc8a854.gif',
          'https://i.pinimg.com/564x/f2/a5/a5/f2a5a5bec52f6ddc8376c3e45b99d3ad.jpg',
        ],
        card_colors: ['#000000'],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/f2/a5/a5/f2a5a5bec52f6ddc8376c3e45b99d3ad.jpg',
    },
    {
      color: 'whitebrown',
      score: 3430,
      title: 'Horimiya by shedo',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#ffffff',
          'background-2': '#ffffff',
          borders: '#735435',
          links: '#ab7e4c',
          sidebar:
            'linear-gradient(#735435, #735435), url("https://i.pinimg.com/474x/f9/1f/ce/f91fced51498b3456b80312fdd953ce1.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#ab7e4c',
          'text-1': '#ab7e4c',
          'text-2': '#ab7e4c',
        },
        custom_cards: [
          'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.Arymax41TKgU51Spjfl5iwHaEK%26pid%3DApi&f=1&ipt=4ae381868c6c45a0a88c0eed59987dbdf67c6e0ecb4da3477f3860f1c39ee749&ipo=images',
          'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.1xSXUt6edGZLH79T3NFlJgAAAA%26pid%3DApi&f=1&ipt=197f2c75c18acfca62150cae371eee15a431f37a13346871eb1b98a911a34986&ipo=images',
          'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.UIoTXpj1pTNxJbTi-JeIYAHaHa%26pid%3DApi&f=1&ipt=2354d3191e829262f8a1cc405447115a646a2e1b0a91189b55a4d0d0e6b9de80&ipo=images',
          'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse3.mm.bing.net%2Fth%3Fid%3DOIP.qU_lyrVuQybwp85BVZngJwHaEK%26pid%3DApi&f=1&ipt=891110a34cf29aba4be66e0abb035a941f39826c84ee0a0a5151725f01a9cf7d&ipo=images',
          'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.Yxs_2b2eoQ2YzQFE9k35xwHaEK%26pid%3DApi&f=1&ipt=b425be0242435e9eadc69ef933cbbb346ae1b185116ae9210438a73b8f373fa0&ipo=images',
          'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.mfz7i55qSDrB8kkmyJomVwHaEK%26pid%3DApi&f=1&ipt=990b9dde06cc17eb9fe4048eaf17da90f116e892d8261b8bfb0af33377b8cc02&ipo=images',
        ],
        card_colors: ['#735435'],
        custom_font: {
          family: "'Protest Riot'",
          link: 'Protest+Riot:wght@400;700',
        },
      },
      preview:
        'https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse2.mm.bing.net%2Fth%3Fid%3DOIP.mfz7i55qSDrB8kkmyJomVwHaEK%26pid%3DApi&f=1&ipt=990b9dde06cc17eb9fe4048eaf17da90f116e892d8261b8bfb0af33377b8cc02&ipo=images',
    },
    {
      color: 'gray',
      score: 4440,
      title: 'Sao by shedo',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#b8b8b8',
          'background-1': '#404040',
          'background-2': '#404040',
          borders: '#242424',
          links: '#9c0707',
          sidebar:
            'linear-gradient(#242424, #242424), url("https://wallpapercave.com/wp/wp1809666.png")',
          'sidebar-text': '#ffffff',
          'text-0': '#000000',
          'text-1': '#242424',
          'text-2': '#9c0707',
        },
        custom_cards: [
          'https://wallpapercave.com/wp/wp7218749.png',
          'https://wallpapercave.com/wp/wp11396903.jpg',
          'https://wallpapercave.com/wp/wp1840316.jpg',
          'https://wallpapercave.com/wp/wp9231922.jpg',
          'https://images7.alphacoders.com/749/749582.png',
          'https://wallpapercave.com/wp/wp7218759.jpg',
        ],
        card_colors: ['#404040'],
        custom_font: { family: "'Pridi'", link: 'Pridi:wght@400;700' },
      },
      preview:
        'https://static1.cbrimages.com/wordpress/wp-content/uploads/2020/08/Sword-Art-Online.jpg?q=50&fit=contain&w=1140&h=&dpr=1.5',
    },
    {
      color: 'black',
      score: 3320,
      title: 'ULTRACANVAS by Ixelaria',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#000000',
          borders: '#ff0000',
          links: '#850000',
          sidebar: 'linear-gradient(#000000, #850000)',
          'sidebar-text': '#ff0000',
          'text-0': '#ff0000',
          'text-1': '#ff0000',
          'text-2': '#ff0000',
        },
        custom_cards: [
          'https://64.media.tumblr.com/5682436363bb11ceafee14b087e2ff4c/4d5dac8e4adc04b5-40/s1280x1920/5662654e7eac7c8a4f5b729421518ae54b45c5c7.gif',
          'https://64.media.tumblr.com/0af8dfe09acdb12e1672c83b7acd8977/9a986d22c2e5b93a-78/s1280x1920/bba22fdef2891abef17445ebdbf713839aa95589.gif',
          'https://64.media.tumblr.com/16090d525be29907acda20077c964881/6fa849007513fa01-02/s1280x1920/b93b55737d5b2050eeaa6081ee74e5536cf6a82f.gifv',
          'https://64.media.tumblr.com/8232b1d34f035a8a369bd2660cdd443e/942ff9a5ad96d15a-0b/s1280x1920/ea87475b6473a3dbaf69b3914cc15769b6670e44.gif',
          'https://64.media.tumblr.com/29c799990d7f44d6c2dc8c2de0166a2a/e83efd4cd752fab0-8f/s1280x1920/a5a35e0d415494899ce70826afdf90b586778981.gifv',
          'https://64.media.tumblr.com/9b8109b7a45e928cb78b620dc4337326/bd8971234efa5148-b0/s640x960/6408ace212feeb6e339d936abfeabaa30fc09b55.gif',
          'https://64.media.tumblr.com/d355a0b19846de3f3f60cbe6577b33be/47743d3541040f42-5f/s1280x1920/a96d22f65165e962357ac41ae73cdd36461fc4ce.gif',
          'https://64.media.tumblr.com/ee96fe76881c05b4da7996dd568e17dc/21af2495aae6ace0-9a/s1280x1920/2c9a1d31295e17ac3a2e361aabcdc629536fc3eb.gifv',
          'https://64.media.tumblr.com/3e8a25fb3ea24039972bbc05ba6dfb8b/97e3ce6d16b90778-46/s540x810/b9d5401f976617267db8dd103b159386d6a68872.gifv',
        ],
        card_colors: ['#d90000'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://64.media.tumblr.com/3e8a25fb3ea24039972bbc05ba6dfb8b/97e3ce6d16b90778-46/s540x810/b9d5401f976617267db8dd103b159386d6a68872.gifv',
    },
    {
      color: 'green',
      score: 3340,
      title: '8-bitFrog by Myra',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#516c59',
          'background-1': '',
          'background-2': 'be97a8',
          borders: '#28432f',
          links: '#dde2a2',
          sidebar: '',
          'sidebar-text': '#be839d',
          'text-0': '#be839d',
          'text-1': '#543b46',
          'text-2': '#76784f',
        },
        custom_cards: [
          'https://cdn.dribbble.com/users/568868/screenshots/14971285/media/3462f44cbd43bcf839bb1a6c28b1098e.gif',
          'https://cdn.dribbble.com/users/568868/screenshots/12081148/media/29c41e37e40f6852d11748b3dc149cfc.gif',
        ],
        card_colors: ['#70d6ff', '#ff70a6', '#ff9770'],
        custom_font: {
          family: "'Silkscreen'",
          link: 'Silkscreen:wght@400;700',
        },
      },
      preview:
        'https://cdn.dribbble.com/users/568868/screenshots/14971285/media/3462f44cbd43bcf839bb1a6c28b1098e.gif',
    },
    {
      color: 'brown',
      score: 3430,
      title: 'Pochacco by Audri',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#c1ad8a',
          'background-1': '#dda15e',
          'background-2': '#bc6c25',
          borders: '#283618',
          links: '#69644f',
          sidebar: '#69644f',
          'sidebar-text': '#eade90',
          'text-0': '#273517',
          'text-1': '#283618',
          'text-2': '#bc6c25',
        },
        custom_cards: [
          'https://media1.tenor.com/m/nSeXvWhdjPEAAAAC/pochacco-happy.gif',
          'https://media1.tenor.com/m/vk8zJCBSHJ4AAAAC/pochacco-dog.gif',
          'https://media1.tenor.com/m/1-L64uMDfvkAAAAd/pochacco.gif',
          'https://media1.tenor.com/m/4OONA09xhs4AAAAC/pochacco-sleepy.gif',
          'https://media1.tenor.com/m/iUjOkkfz3K0AAAAC/pochacco-cry.gif',
          'https://media1.tenor.com/m/62YQCrZkjiQAAAAC/yellow-pochacco.gif',
          'https://media1.tenor.com/m/u0S3GB8xlHQAAAAC/pochacco-sanrio.gif',
          'https://media1.tenor.com/m/RQYTS45vJ-sAAAAC/pochacco.gif',
        ],
        card_colors: [
          '#d97900',
          '#8d9900',
          '#8f1a0a',
          '#619e90',
          '#61769e',
          '#f06291',
          '#bd3c14',
          '#4554a4',
        ],
        custom_font: { family: "'Rubik'", link: 'Rubik:wght@400;700' },
      },
      preview:
        'https://media1.tenor.com/m/62YQCrZkjiQAAAAC/yellow-pochacco.gif',
    },
    {
      color: 'black',
      score: 3330,
      title: 'Ferrari by @36H0udin1',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#240000',
          'background-2': '#330000',
          borders: '#470000',
          links: '#f05656',
          sidebar: 'linear-gradient(#2e0000, #d10000)',
          'sidebar-text': '#000000',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://www.racefans.net/wp-content/uploads/2023/11/racefansdotnet-7106285_HiRes.jpg',
          'https://cdn-2.motorsport.com/images/amp/Y9985EAY/s6/ferrari-sf-24.jpg',
          'https://media.formula1.com/image/upload/t_16by9Centre/f_auto/q_auto/v1707821717/fom-website/2023/Miscellaneous/ferrari-sf-24-5.png.transform/9col/image.png',
          'https://www.motorsinside.com/images/photo/article/f12024/miniature/1500/ferrari-deux-sf24-livree.jpg',
          'https://t4.ftcdn.net/jpg/06/27/87/33/360_F_627873367_iO43b61sLu0G635Ob1gv9YOdsScj1JeX.jpg',
          'https://i.kinja-img.com/image/upload/c_fit,q_60,w_645/4dfad6928449d54dfa99dc524f34f9cb.jpg',
          'https://ichef.bbci.co.uk/news/1024/cpsprodpb/9968/production/_128627293_carresize.jpg',
          'https://www.outsport.cz/data/ferarri.jpg',
          'https://media.gq.com/photos/6172caccb36b36132bb9ee50/master/pass/GettyImages-1306711225.jpg',
        ],
        card_colors: [
          '#e01e37',
          '#c71f37',
          '#b21e35',
          '#a11d33',
          '#6e1423',
          '#e01e37',
          '#c71f37',
          '#b21e35',
          '#a11d33',
        ],
        custom_font: { family: "'Tektur'", link: 'Tektur:wght@400;700' },
      },
      preview:
        'https://i.kinja-img.com/image/upload/c_fit,q_60,w_645/4dfad6928449d54dfa99dc524f34f9cb.jpg',
    },
    {
      color: 'black',
      score: 4440,
      title: 'Omori by Stinky One',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0d0d0d',
          'background-1': '#201f23',
          'background-2': '#595959',
          borders: '#000000',
          links: '#ffffff',
          sidebar:
            'linear-gradient(#000000c7, #0d0d0dc7), center url("https://i.pinimg.com/564x/2e/4e/cf/2e4ecf119cc3962c111171646e08424f.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#ffffff',
          'text-1': '#e0e0e0',
          'text-2': '#f5f5f5',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/0f/89/17/0f8917859e830b3c96fabcd89d7734ac.jpg',
          'https://i.pinimg.com/474x/45/62/1c/45621c81b80c6a8812eba161bda6ad66.jpg',
          'https://i.pinimg.com/564x/e6/62/a3/e662a3f756bf6a8975d0b515f88ed4da.jpg',
          'https://i.pinimg.com/originals/7c/a8/bd/7ca8bdce154bfad455039e556fc25776.gif',
          'https://c.tenor.com/Nzif01-Iz0cAAAAC/tenor.gif',
          'https://i.pinimg.com/564x/b9/d7/d6/b9d7d606beef4a2def3ead7b7aabe224.jpg',
          'https://i.pinimg.com/originals/8f/8d/46/8f8d46bdd4592bf990dbdf0226977405.gif',
          'https://i.pinimg.com/originals/ef/00/35/ef0035d7a51dd84dec11ab8f1fa2537f.gif',
        ],
        card_colors: ['#3d3e45'],
        custom_font: {
          family: "'Special Elite'",
          link: 'Special Elite:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/474x/45/62/1c/45621c81b80c6a8812eba161bda6ad66.jpg',
    },
    {
      color: 'blue',
      score: 1320,
      title: 'Ashoka by Sasha',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#194843',
          'background-1': '#3ea399',
          'background-2': '#5aedde',
          borders: '#13342e',
          links: '#36d9a2',
          sidebar: 'linear-gradient(#65aea6, #143935)',
          'sidebar-text': '#f5f5f5',
          'text-0': '#65d2b1',
          'text-1': '#b2f5e8',
          'text-2': '#36ab93',
        },
        custom_cards: [
          'https://images.fineartamerica.com/images-medium-large-5/spring-green-trees-with-reflections-sharon-freeman.jpg',
          'https://i.redd.it/l0hij2dgmkd71.jpg',
          'https://disneyartonmain.com/cdn/shop/products/ahsokas-troops.jpg?v=1681081939',
          'https://i0.wp.com/mediachomp.com/wp-content/uploads/2021/10/ahsoka-fan-art-02.jpg?resize=650%2C650&ssl=1',
          'https://cdn.freewebstore.com/origin/521469/ahsoka_online_update.jpg',
          'https://artistmonkeys.com/wp-content/uploads/2021/09/Ahsoka-Tano-taken-by-Ezra-Rebels.jpg',
          'https://i.redd.it/wu8s47i4uapb1.jpg',
          'https://everydayoriginal.com/wp-content/uploads/2022/03/ahsoka-full.jpg',
          'https://i.redd.it/4spfxs2x0ie61.jpg',
          'https://cdnb.artstation.com/p/assets/images/images/040/911/225/large/vishnu-gunapathi-snowsoka.jpg?1630241643',
        ],
        card_colors: [
          '#63c5d2',
          '#69bed6',
          '#6fb7da',
          '#74afde',
          '#7aa8e2',
          '#80a1e5',
          '#8599e9',
          '#8b92ed',
          '#918bf1',
        ],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview: 'https://i.redd.it/4spfxs2x0ie61.jpg',
    },
    {
      color: 'purple',
      score: 4340,
      title: 'Enchanted by margaritavil',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#381e2c',
          'background-1': '#1f1f2e',
          'background-2': '#1e1e2e',
          borders: '#f7d9e8',
          links: '#e6a3d4',
          sidebar: '#a6598e',
          'sidebar-text': '#c4cbee',
          'text-0': '#bfc9e8',
          'text-1': '#7f849c',
          'text-2': '#a6e3a1',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/d4/b2/d7/d4b2d76e8fcd4fc56d19cc0a123bd8e2.jpg',
          'https://i.pinimg.com/236x/73/da/a1/73daa1d57e1a4c7cdfafd38628320b24.jpg',
          'https://i.pinimg.com/736x/96/f9/ca/96f9ca563f4c683a425517268aed11d1.jpg',
          'https://i.pinimg.com/236x/38/1e/8d/381e8d1338b4453c8a3c1e6dc1e88846.jpg',
          'https://i.pinimg.com/236x/b9/73/35/b97335cc9baccabdf99e9c24f661449e.jpg',
        ],
        card_colors: ['#cdb4db', '#ffc8dd', '#ffafcc', '#bde0fe', '#a2d2ff'],
        custom_font: {
          family: "'Nanum Myeongjo'",
          link: 'Nanum+Myeongjo:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/236x/b9/73/35/b97335cc9baccabdf99e9c24f661449e.jpg',
    },
    {
      color: 'brown',
      score: 3330,
      title: 'Possum by singularity',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#3b2926',
          'background-1': '#1e1e1e',
          'background-2': '#262626',
          borders: '#411e06',
          links: '#c45c17',
          sidebar: 'linear-gradient(#561b10, #1c0303)',
          'sidebar-text': '#f5f5f5',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://crittercontroloflakecounty.com/wp-content/uploads/how-to-get-rid-of-opossums-ain-a-your-house-and-yard.jpg',
          'https://i.redd.it/ktwzh2sh8yea1.jpg',
          'https://www.cbc.ca/natureofthings/content/legacy/NCC_Opossums3_1920.jpg',
          'https://i.chzbgr.com/full/4508972288/h62459263/the-lost-cat-was-pregnant',
          'https://i.pinimg.com/originals/c5/c7/00/c5c7009f7ed780bf0be04b3841a4913b.png',
          'https://miro.medium.com/v2/resize:fill:1200:632/g:fp:0.5:0.49/1*Amfgxh6hACFzV1tKqZs9lQ.jpeg',
          'https://lh3.googleusercontent.com/proxy/k1v2a_wgyDcVvcSNOsZcPBIlD1Lsbs5iB7NfDxet1fGmqcUNGavcAfU5aVoyzI1uNiQWrF_BfZzliPmjvh2KpdkWX9nYhDBUjiEvuw',
          'https://irp.cdn-website.com/b44e0cd2/dms3rep/multi/Orange+Beach+Wildlife+Opossum.jpg',
          'https://thehardtimes.net/wp-content/uploads/2020/10/shutterstock_54565696.jpg',
          'https://wildsidewildliferemoval.ca/wp-content/uploads/2022/06/image1-7.jpg',
          'https://onehourpestcontrol.nyc/wp-content/uploads/2016/10/IMG_6446-1080x675.jpg',
        ],
        card_colors: ['#c45c17'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://onehourpestcontrol.nyc/wp-content/uploads/2016/10/IMG_6446-1080x675.jpg',
    },
    {
      color: 'black',
      score: 2230,
      title: 'Leveling by MJandik',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0f0f0f',
          'background-1': '#0c0c0c',
          'background-2': '#141414',
          borders: '#1e1e1e',
          links: '#f5f5f5',
          sidebar: '#0c0c0c',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://uploads.disquscdn.com/images/262785c1a55902f267e0369a3059e36b04536e5800abe00a9520628398c78821.gif',
          'https://media1.tenor.com/images/b25575e97f24c5a122c96e2c34223f6d/tenor.gif?itemid=18599147',
          'https://discuss.pencil2d.org/uploads/default/original/2X/f/ff9d547fc595cd94df899e70c051177ce23517e0.gif',
          'https://media.tenor.com/Lk7c5qcQPh8AAAAC/sung-jin-woo-solo-leveling.gif',
          'https://media.tenor.com/zKmb_rdBxkEAAAAC/sung-jin-woo-sololeveling.gif',
        ],
        card_colors: ['#6f34f9'],
        custom_font: {
          family: "'Roboto Mono'",
          link: 'Roboto+Mono:wght@400;700',
        },
      },
      preview:
        'https://media1.tenor.com/images/b25575e97f24c5a122c96e2c34223f6d/tenor.gif?itemid=18599147',
    },
    {
      color: 'black',
      score: 2320,
      title: 'DOOM by Wiixle',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#000000',
          borders: '#ff0000',
          links: '#850000',
          sidebar: 'linear-gradient(#000000, #ff0000)',
          'sidebar-text': '#ffffff',
          'text-0': '#ffd1d1',
          'text-1': '#cda2a2',
          'text-2': '#330000',
        },
        custom_cards: [
          'https://media1.giphy.com/media/QDK1pCI43lGhO/200w.gif?cid=6c09b952nwbuyea5fhdmua7rq71ew15bppokgxrm1cd6ydnr&ep=v1_gifs_search&rid=200w.gif&ct=g',
          'https://i.makeagif.com/media/4-16-2015/ZwqNfS.gif',
          'https://steamuserimages-a.akamaihd.net/ugc/89345971217665745/BBDD3A56734A0B3DB16768125E2CBCD9DB625F16/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false',
          'https://i.pinimg.com/originals/f1/b0/1e/f1b01e4b9aad8af2648fa0cf1c5e0fda.gif',
          'https://media.tenor.com/X2FKQ6M_p3oAAAAM/doom-doom-eternal.gif',
          'https://i.pinimg.com/originals/7c/81/1e/7c811e63e22e0818fae20ae705d4604b.gif',
          'https://media2.giphy.com/media/ZZTL1YLKZ48URCoC6B/giphy.gif?cid=6c09b952enuww2xkejoisww6idw2nin0juyxfx961acglz8x&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=g',
          'https://media3.giphy.com/media/gdqbQ1cPSHvQBmy2Xu/200w.gif?cid=82a1493b4xda1mw0k5ui82fccu16y1pwvwrb1pqms6mss1cl&ep=v1_gifs_related&rid=200w.gif&ct=g',
        ],
        card_colors: [
          '#e66666',
          '#ce5757',
          '#b64949',
          '#9e3a3a',
          '#852b2b',
          '#6d1d1d',
          '#550e0e',
          '#3d0000',
        ],
        custom_font: { family: "'Tektur'", link: 'Tektur:wght@400;700' },
      },
      preview:
        'https://media3.giphy.com/media/gdqbQ1cPSHvQBmy2Xu/200w.gif?cid=82a1493b4xda1mw0k5ui82fccu16y1pwvwrb1pqms6mss1cl&ep=v1_gifs_related&rid=200w.gif&ct=g',
    },
    {
      color: 'black',
      score: 4440,
      title: 'JJKManga by lxteralsxmp',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#121212',
          'background-2': '#ffffff',
          borders: '#707070',
          links: '#bfbfbf',
          sidebar:
            'linear-gradient(#5c5c5cc7, #000000c7), center url("https://i.pinimg.com/736x/46/ec/52/46ec52beac255849ce49b03f90ba54a7.jpg")',
          'sidebar-text': '#c5c5c5',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#cfcfcf',
        },
        custom_cards: [
          'https://preview.redd.it/pstt2forpcz61.jpg?width=640&crop=smart&auto=webp&s=1af2ed0671205c0ebef1d74f0a336f0eccab541c',
          'https://beebom.com/wp-content/uploads/2022/11/gojo-and-geto-friendship.jpg',
          'https://pbs.twimg.com/media/Ep7wg1SXIAAIDhO.jpg',
          'https://static1.cbrimages.com/wordpress/wp-content/uploads/2021/08/pjimage-53.jpg',
          'https://pm1.aminoapps.com/7619/2d803e2099c22b73aaf6b440acb70452dcdc390er1-837-548v2_hq.jpg',
          'https://pbs.twimg.com/media/DuyfVGaWsAIVn8q.jpg',
        ],
        card_colors: [
          '#3f3f3f',
          '#5f5f5f',
          '#7f7f7f',
          '#9f9f9f',
          '#bfbfbf',
          '#e0e0e0',
        ],
        custom_font: {
          family: "'Silkscreen'",
          link: 'Silkscreen:wght@400;700',
        },
      },
      preview:
        'https://beebom.com/wp-content/uploads/2022/11/gojo-and-geto-friendship.jpg',
    },
    {
      color: 'lightgreen',
      score: 4340,
      title: 'Carebear by SavageFroggies',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#D5E7B8',
          'background-1': '#ECEBC9',
          'background-2': '#C4DEA4',
          borders: '#84a98c',
          links: '#d8f5c7',
          sidebar:
            'linear-gradient(#e5f1e6c7, #e5d7e3c7), center url("https://i.pinimg.com/236x/21/7b/98/217b98305656a5c956bc124dee4a68c7.jpg")',
          'sidebar-text': '#CAAD7E',
          'text-0': '#CAAD7E',
          'text-1': '#CAAD7E',
          'text-2': '#CAAD7E',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/41/84/cd/4184cdb107f5ee72e85c82aa5fbbc9cf.jpg',
          'https://i.pinimg.com/236x/59/f7/f9/59f7f942136dc8ccea8163b30c555255.jpg',
          'https://i.pinimg.com/236x/d6/4d/f9/d64df93f6171d2858c2c16107934c9d5.jpg',
        ],
        card_colors: ['#fff1e6', '#fde2e4', '#fad2e1'],
        custom_font: { family: "'Comfortaa'", link: 'Comfortaa:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/236x/59/f7/f9/59f7f942136dc8ccea8163b30c555255.jpg',
    },
    {
      color: 'green',
      score: 4330,
      title: 'HTTYD by Paige',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#2a2c1e',
          'background-1': '#25211f',
          'background-2': '#40474a',
          borders: '#84a98c',
          links: '#838736',
          sidebar: 'linear-gradient(#2a2c1e, #40474a)',
          'sidebar-text': '#e2e8de',
          'text-0': '#e2e8de',
          'text-1': '#cad2c5',
          'text-2': '#adb1aa',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/f6/63/52/f6635225f24f4381173ea93186d0c182.jpg',
          'https://i.pinimg.com/originals/ef/13/1e/ef131e8da154bd39193b02042d7bbf55.jpg',
          'https://i.pinimg.com/originals/ad/2d/ac/ad2dac9226a689023382f58a192302d5.jpg',
          'https://i.pinimg.com/564x/56/8d/3f/568d3fca78a31231393fcacd51a35595.jpg',
          'https://i.pinimg.com/originals/f4/e8/97/f4e8979fd6346cd3332da5ead06e3c94.png',
        ],
        card_colors: ['#3e463b', '#685735', '#93682f', '#bd7929', '#e88b23'],
        custom_font: { link: 'Karla:wght@400;700', family: "'Karla'" },
      },
      preview:
        'https://i.pinimg.com/564x/56/8d/3f/568d3fca78a31231393fcacd51a35595.jpg',
    },
    {
      color: 'black',
      score: 3320,
      title: 'Pilot by Zombie',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#003f66',
          'background-2': '#0996b9',
          borders: '#000f5c',
          links: '#ffffff',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://media.defense.gov/2021/Mar/03/2002592996/1280/1280/0/210302-F-JV039-1090M.JPG")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#00d5ff',
        },
        custom_cards: [
          'https://media.tenor.com/aAjvk9AAkqEAAAAM/f14-formation.gif',
          'https://i.imgur.com/6EXRorb.gif',
          'https://i.pinimg.com/originals/1d/be/12/1dbe12673592dcd1a5a485bbd679d2a0.gif',
          'https://media.tenor.com/6xiz08dxPfIAAAAM/sukhoi-sunday.gif',
          'https://royfmc.files.wordpress.com/2023/09/img_0603.gif?w=450',
          'https://i.redd.it/r0nq2ln7hks61.gif',
          'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/16142790-7f79-47c4-8d25-8b32e3f4cae2/d8ccl4l-e2f3e3ce-5c9f-4ea9-948a-7bcf19b496ac.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzE2MTQyNzkwLTdmNzktNDdjNC04ZDI1LThiMzJlM2Y0Y2FlMlwvZDhjY2w0bC1lMmYzZTNjZS01YzlmLTRlYTktOTQ4YS03YmNmMTliNDk2YWMuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.LsQHglVDslYvM0YSThzHJAi5focdswe17eGgKxM4wL0',
        ],
        card_colors: [
          '#007bad',
          '#006da3',
          '#005e99',
          '#00508e',
          '#004184',
          '#00337a',
          '#002570',
        ],
        custom_font: { family: "'Tektur'", link: 'Tektur:wght@400;700' },
      },
      preview: 'https://media.tenor.com/aAjvk9AAkqEAAAAM/f14-formation.gif',
    },
    {
      color: 'lightgreen',
      score: 4440,
      title: 'Monet by Rivka',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fafff5',
          'background-1': '#f3f9eb',
          'background-2': '#deeab3',
          borders: '#5c7a41',
          links: '#445412',
          sidebar:
            'linear-gradient(#325b10c7, #d1eec9c7), center url("https://i.pinimg.com/564x/6b/16/5e/6b165e3afb77d1e2ae8b123cf9734e13.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#2e5606',
          'text-1': '#333d29',
          'text-2': '#333d29',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/e3/d1/89/e3d189730e159acbd9b6a5e1f70a77b4.jpg',
          'https://i.pinimg.com/564x/ef/4f/56/ef4f56f6d701fbb0e865009343036623.jpg',
          'https://i.pinimg.com/236x/15/a0/7a/15a07aed7006bfe3b19448fb93fb2eca.jpg',
          'https://i.pinimg.com/564x/38/be/cd/38becd1b22989bdd6c89f02b862ac851.jpg',
          'https://i.pinimg.com/236x/f6/ec/70/f6ec709315ec9e89f5bafe2f48014d19.jpg',
          'https://i.pinimg.com/564x/4c/a7/06/4ca706839ee6c836f50e5e9901f77303.jpg',
        ],
        card_colors: ['#445412'],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/236x/f6/ec/70/f6ec709315ec9e89f5bafe2f48014d19.jpg',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'Softghibl by rakkooi',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#FAF8F0',
          'background-1': '#e2e4d3',
          'background-2': '#FAF8F0',
          borders: '#9c9981',
          links: '#683C3F',
          sidebar:
            "linear-gradient(#E2BBADc7, #BDBAA3c7), center url('https://i.redd.it/gynkl0pnw0ib1.jpg/')",
          'sidebar-text': '#FAF8F0',
          'text-0': '#4D4C42',
          'text-1': '#9c9981',
          'text-2': '#BDBAA3',
        },
        custom_cards: [
          'https://studioghibli.jp/static/media/arietty.9ddea0ab.gif',
          'https://i.makeagif.com/media/7-23-2018/CRxHot.gif',
          'https://media.tenor.com/oABoYJfl05kAAAAM/majonotakkyubin-kikisdelivery.gif',
          'https://media1.tenor.com/m/QeNq3_I5-owAAAAC/green-studio-ghibli.gif',
          'https://media1.tenor.com/m/YjCqkJ7kQRkAAAAC/my-neighbor-totoro.gif',
          'https://media0.giphy.com/media/13cqvMx0yH3eko/200w.gif?cid=6c09b952ym58wm7ndsa6xqhuhv0i15oj4xjce7zxzlw3whac&ep=v1_gifs_search&rid=200w.gif&ct=g',
          'https://64.media.tumblr.com/b61514ab8808e411d16e78e56e370948/tumblr_nljbs6oe4T1shdhdjo1_540.gif',
          'https://studioghibli.jp/static/media/cat-gif.3cd2ba79.gif',
          'https://media.tenor.com/JYgEKjfi3uIAAAAM/anim-howls-moving-castle.gif',
        ],
        card_colors: ['#afa896', '#b3a898', '#b7a89b', '#bba89d'],
        custom_font: { family: "'Quicksand'", link: 'Quicksand:wght@400;700' },
      },
      preview:
        'https://media.tenor.com/oABoYJfl05kAAAAM/majonotakkyubin-kikisdelivery.gif',
    },
    {
      color: 'beige',
      score: 4441,
      title: 'Books by Kris',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffec',
          'background-1': '#ecd6c0',
          'background-2': '#ffffec',
          borders: '#a68069',
          links: '#a68069',
          sidebar: 'linear-gradient(#ecd6c0, #d1aa92)',
          'sidebar-text': '#715a4a',
          'text-0': '#a68069',
          'text-1': '#bf9780',
          'text-2': '#d8af97',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/63/62/66/6362664153bc52800597873b8608042d.jpg',
          'https://i.pinimg.com/736x/59/7b/f4/597bf46bce4e0ff7d948ff7aa1bd92a6.jpg',
          'https://i.pinimg.com/736x/69/1d/9e/691d9e499912c996f69dfbf983419144.jpg',
          'https://i.pinimg.com/564x/84/10/55/84105549a8584d867f0ecdca4744f5dd.jpg',
          'https://i.pinimg.com/564x/d1/11/d7/d111d7f96d7739aec767265b314f2e86.jpg',
          'https://i.pinimg.com/564x/b3/25/f0/b325f024a566f668f2bb4903a2bd5d5c.jpg',
          'https://i.pinimg.com/564x/ef/a7/46/efa746a6be5004b085e8db4e13c002fe.jpg',
          'https://i.pinimg.com/564x/60/64/a4/6064a4db3f9f2569f9632ff381a89a94.jpg',
          'https://i.pinimg.com/736x/3c/bb/b4/3cbbb4c7204a3e3bd86a795bff62766d.jpg',
          'https://i.pinimg.com/564x/d3/16/33/d31633ddf6fc7fa85877c7d1dc3b0b0f.jpg',
          'https://i.pinimg.com/564x/c4/03/0b/c4030b0d68d93fce9fca83796fcce15b.jpg',
        ],
        card_colors: ['#6c5346'],
        custom_font: { family: "'Poppins'", link: 'Poppins:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/b3/25/f0/b325f024a566f668f2bb4903a2bd5d5c.jpg',
    },
    {
      color: 'brown',
      score: 3330,
      title: 'DUNE by Mavery',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#E9CB8E',
          'background-1': '#f8c457',
          'background-2': '#66280C',
          borders: '##baa684',
          links: '#8c5c10',
          sidebar: 'linear-gradient(#EB7925, #000000)',
          'sidebar-text': '#f5f5f5',
          'text-0': '#3576AE',
          'text-1': '#A5663A',
          'text-2': '#AFADAB',
        },
        custom_cards: [
          'https://screenrant.com/wp-content/uploads/2021/09/Dune-Oscar-Isaac-Duke-Leto-Atreides.jpg',
          'https://www.denofgeek.com/wp-content/uploads/2022/03/dune-sandworm.jpg?fit=1300%2C683',
          'https://static0.gamerantimages.com/wordpress/wp-content/uploads/2023/04/dune-2-will-have-this-epic-difference-from-the-first-movie.jpg',
          'https://videolibrarian.com/downloads/4302/download/Jessica.jpeg?cb=e6758456ef880b677d4d802c9b4f3d2e',
          'https://media-cldnry.s-nbcnews.com/image/upload/t_fit-1500w,f_auto,q_auto:best/rockcms/2021-10/211029-dune-Javier-bardem-Stilgar-se-128p-41142b.jpg',
          'https://images.bauerhosting.com/empire/2023/08/gurney.jpg?ar=16%3A9&fit=crop&crop=top&auto=format&w=undefined&q=80',
          'https://i.ytimg.com/vi/_rQrkheSXTo/maxresdefault.jpg',
          'https://cst.brightspotcdn.com/dims4/default/beb71c3/2147483647/strip/true/crop/3006x1716+545+0/resize/1461x834!/quality/90/?url=https%3A%2F%2Fcdn.vox-cdn.com%2Fthumbor%2FtRYyjT37JMa0oWBPwAmYKN1Ih4s%3D%2F0x0%3A4096x1716%2F4096x1716%2Ffilters%3Afocal%282007x528%3A2008x529%29%2Fcdn.vox-cdn.com%2Fuploads%2Fchorus_asset%2Ffile%2F22964918%2Frev_1_DUN_T2_0063_High_Res_JPEG.jpeg',
        ],
        card_colors: ['#8c5c10'],
        custom_font: { family: "'Jost'", link: 'Jost:wght@400;700' },
      },
      preview:
        'https://videolibrarian.com/downloads/4302/download/Jessica.jpeg?cb=e6758456ef880b677d4d802c9b4f3d2e',
    },
    {
      color: 'red',
      score: 3340,
      title: 'Spiderman by Gianna',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#571414',
          'background-1': '#d76060',
          'background-2': '#000000',
          borders: '#ffffff',
          links: '#ffffff',
          sidebar: '#000000',
          'sidebar-text': '#ff0000',
          'text-0': '#000000',
          'text-1': '#000000',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/3b/cd/c1/3bcdc12c8c3370c3d45306ed30f3cd33.jpg',
          'https://i.pinimg.com/564x/ff/c8/e0/ffc8e092f4f10e789e624649fcf23021.jpg',
          'https://i.pinimg.com/564x/6e/e5/ac/6ee5ac7601dac39c3635a3f0c49caea2.jpg',
          'https://i.pinimg.com/564x/ef/01/e5/ef01e5806afdd6ba9dd8da3f037ec636.jpg',
          'https://i.pinimg.com/564x/73/58/29/735829135e21b6a4783c8ff815a63609.jpg',
          'https://i.pinimg.com/564x/ab/1b/ec/ab1bec9f79c2173291a8a6a9c80d3825.jpg',
          'https://i.pinimg.com/564x/32/e5/f7/32e5f74b5a17257b8a52646967371ef3.jpg',
          'https://i.pinimg.com/564x/c3/51/64/c35164a0128e8389778bb9afe0c2497d.jpg',
          'https://i.pinimg.com/564x/53/24/ba/5324ba6a650df291afe845e955717a47.jpg',
        ],
        card_colors: ['#ff0000'],
        custom_font: {
          family: "'Barriecito'",
          link: 'Barriecito:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/ef/01/e5/ef01e5806afdd6ba9dd8da3f037ec636.jpg',
    },
    {
      color: 'pink',
      score: 4440,
      title: 'MyMelody by linabunny',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f4e1e1',
          'background-1': '#e5bdbd',
          'background-2': '#ffd6da',
          borders: '#e5bdbd',
          links: '#b77179',
          sidebar:
            'linear-gradient(#e5bdbdc7, #e5bdbdc7), center url("https://i.pinimg.com/564x/50/7d/7b/507d7be78bf76514cc0d92479d9dfe9f.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#79444a',
          'text-1': '#c78585',
          'text-2': '#ab6969',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/06/d5/3c/06d53c3c5eca19a8aa94f2ef2baf21db.jpg',
          'https://i.pinimg.com/564x/30/d0/84/30d084e134aaf326bc3359d330696d65.jpg',
          '  https://i.pinimg.com/564x/90/4c/24/904c2478127aef7a19d05dc13efc6999.jpg',
          'https://i.pinimg.com/564x/2d/a9/5b/2da95b31a75c0913c5d29b4142ad5aad.jpg',
          'https://i.pinimg.com/564x/fd/a3/06/fda3067498e9380985bcbedaa74b3d04.jpg',
          'https://i.pinimg.com/564x/14/06/f0/1406f086babcb28412cdfb74876e4c17.jpg',
          'https://i.pinimg.com/736x/dd/59/c0/dd59c05dc5f0511ff0c5df23a73f7ac5.jpg',
        ],
        card_colors: ['#b77179'],
        custom_font: { family: "'Quicksand'", link: 'Quicksand:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/06/d5/3c/06d53c3c5eca19a8aa94f2ef2baf21db.jpg',
    },
    {
      color: 'brown',
      score: 2340,
      title: 'DrumBot by Jam',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#311b07',
          'background-1': '#76481e',
          'background-2': '#a56122',
          borders: '#9f84a9',
          links: '#5e784f',
          sidebar: '#771f09',
          'sidebar-text': '#e2e8de',
          'text-0': '#e7dee8',
          'text-1': '#cad2c5',
          'text-2': '#b1aab0',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/22/c3/62/22c3623a016deed947d2e5381ef17817.jpg',
          'https://i.pinimg.com/736x/3c/c9/a8/3cc9a86dcd81f74330ec8e641511f7b2.jpg',
          'https://i.pinimg.com/474x/75/db/cf/75dbcfeb4ab6054a294178ad0372208f.jpg',
          'https://i.pinimg.com/474x/ac/aa/db/acaadb1154673e06fd523383f4295ac7.jpg',
          'https://i.pinimg.com/474x/c7/54/4d/c7544dbd1b063a4e2479d64bed9a44e0.jpg',
          'https://i.pinimg.com/474x/e9/c5/2c/e9c52c7ae12c7ccfb258b005523b7534.jpg',
          'https://i.pinimg.com/474x/6f/58/f1/6f58f1d9d37ee7ab3f46898b9234022e.jpg',
          'https://i.pinimg.com/474x/25/9d/a4/259da43056295cb990114288d41bd104.jpg',
          'https://i.pinimg.com/474x/9e/37/d7/9e37d748b2bb873fa899ef93dcdf65c6.jpg',
          'https://i.pinimg.com/736x/c2/ff/fa/c2fffa652c68bdc9f0fd973f5ed847fd.jpg',
        ],
        card_colors: [
          '#eaac8b',
          '#e56b6f',
          '#b56576',
          '#6d597a',
          '#355070',
          '#eaac8b',
          '#e56b6f',
          '#b56576',
          '#6d597a',
          '#355070',
          '#eaac8b',
          '#e56b6f',
          '#b56576',
          '#6d597a',
        ],
        custom_font: { family: "'Oswald'", link: 'Oswald:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/474x/c7/54/4d/c7544dbd1b063a4e2479d64bed9a44e0.jpg',
    },
    {
      color: 'lightblue',
      score: 4430,
      title: 'Ena by Stella',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#dbebff',
          'background-1': '#fbed50',
          'background-2': '#Fbed50',
          borders: '#050505',
          links: '#000000',
          sidebar: 'linear-gradient(#fbf6bc, #fff705)',
          'sidebar-text': '#000000',
          'text-0': '#000000',
          'text-1': '#000000',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-H9-so45bHEocg1gdR9buNmYSBjMRZbSU1wL8K7rdDA&s',
          'https://i.ytimg.com/vi/Td7CBNu0914/maxresdefault.jpg',
          'https://i.ytimg.com/vi/TmXe-ZGr5RM/sddefault.jpg',
          'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/3c556156-a266-4003-8b27-6a0348a5f832/def45zs-c706163b-eaf0-4329-9be1-a8d644675453.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzNjNTU2MTU2LWEyNjYtNDAwMy04YjI3LTZhMDM0OGE1ZjgzMlwvZGVmNDV6cy1jNzA2MTYzYi1lYWYwLTQzMjktOWJlMS1hOGQ2NDQ2NzU0NTMuanBnIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.o3K98P0UVIHpPLyw0gxp38wCd5NptOSJMJKTGUjlIVM',
        ],
        card_colors: [
          '#f1be00',
          '#0b9be3',
          '#0b9be3',
          '#0b9be3',
          '#f1be00',
          '#f1be00',
          '#f1be00',
          '#0b9be3',
          '#0b9be3',
        ],
        custom_font: {
          family: "'Expletus Sans'",
          link: 'Expletus+Sans:wght@400;700',
        },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-H9-so45bHEocg1gdR9buNmYSBjMRZbSU1wL8K7rdDA&s',
    },
    {
      color: 'yellow',
      score: 4340,
      title: 'Spongebob by Lindsey',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e6f59e',
          'background-1': '#cae2f1',
          'background-2': '#ffccd6',
          borders: '#8eeb00',
          links: '#fe9503',
          sidebar:
            'linear-gradient(#4caae3c7, #0d67a2c7), center url("https://garden.spoonflower.com/c/14330302/p/f/m/oVmiVmRbfymP_gs9bBvDr9CJH4hzntV6nC7zeA1TQoSQttGouA0T6G0/Bikini%20bottom%20bamboo%20pattern.jpg")',
          'sidebar-text': '#d4ff00',
          'text-0': '#ff0088',
          'text-1': '#4caae3',
          'text-2': '#fe9503',
        },
        custom_cards: [
          'https://render.fineartamerica.com/images/rendered/default/print/6.5/8/break/images/artworkimages/medium/3/squidward-spongebob.jpg',
          'https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/patrick-star-squidward.jpg',
          'https://static1.srcdn.com/wordpress/wp-content/uploads/2020/09/spongebobs-pineapple-house.jpg?q=50&fit=crop&w=1500&dpr=1.5',
          'https://pbs.twimg.com/media/DL6LDrGX0AAIcrm.jpg',
          'https://i.pinimg.com/originals/eb/2c/be/eb2cbefcd1ef8578a5f10376dfb608bf.jpg',
          'https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/gary-the-snail-squidward.jpg',
          'https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/spongebob-squidward.jpg',
        ],
        card_colors: ['#fe9503'],
        custom_font: {
          family: "'Inria Sans'",
          link: 'Inria+Sans:wght@400;700',
        },
      },
      preview:
        'https://render.fineartamerica.com/images/rendered/default/print/6.5/8/break/images/artworkimages/medium/3/squidward-spongebob.jpg',
    },
    {
      color: 'black',
      score: 4320,
      title: 'Galaxy by Michael',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000',
          'background-1': '#7000cc',
          'background-2': '#000',
          borders: '#7000cc',
          links: '#c581fe',
          sidebar:
            'linear-gradient(#7000ccc7, #000000c7), center url("https://tse4.mm.bing.net/th?id=OIP.9l5Nj02sifGzmS-HVozvJAHaEK&pid=Api&P=0&h=220")',
          'sidebar-text': '#19002e',
          'text-0': '#460075',
          'text-1': '#f2e0ff',
          'text-2': '#efdbff',
        },
        custom_cards: [
          'https://tse4.mm.bing.net/th?id=OIP.9l5Nj02sifGzmS-HVozvJAHaEK&pid=Api&P=0&h=220',
        ],
        card_colors: ['#7000cc'],
        custom_font: {
          family: "'Expletus Sans'",
          link: 'Expletus+Sans:wght@400;700',
        },
      },
      preview:
        'https://tse4.mm.bing.net/th?id=OIP.9l5Nj02sifGzmS-HVozvJAHaEK&pid=Api&P=0&h=220',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'Angel by Hannah',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fef9f6',
          'background-1': '#fee4d2',
          'background-2': '#f2968c',
          borders: '#b9c5cf',
          links: '#89929a',
          sidebar:
            'linear-gradient(#efe1d7c7, #cda588c7), center url(https://i.pinimg.com/236x/33/9d/b2/339db24dd07a8016ff98f34de24b714e.jpg)',
          'sidebar-text': '#ffffff',
          'text-0': '#2f1504',
          'text-1': '#a28267',
          'text-2': '#5c483d',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/87/0f/1b/870f1b16d1e9f66ca5d9bdbc04982c12.jpg',
          'https://i.pinimg.com/236x/ae/8a/a9/ae8aa95413111050b2fe05252c719a8a.jpg',
          'https://i.pinimg.com/236x/1f/59/50/1f5950ca5199a6b9ce82afb157dbb835.jpg',
          'https://i.pinimg.com/236x/4d/1d/c0/4d1dc047338e01267b720199e5abf7af.jpg',
        ],
        card_colors: ['#ccaea3'],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/236x/4d/1d/c0/4d1dc047338e01267b720199e5abf7af.jpg',
    },
    {
      color: 'purple',
      score: 2440,
      title: 'Evangelion by DixeCup',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#160f1a',
          'background-1': '#5e3375',
          'background-2': '#000000',
          borders: '#2c6d34',
          links: '#338132',
          sidebar: 'linear-gradient(#197b4d, #000000)',
          'sidebar-text': '#b59acb',
          'text-0': '#478b46',
          'text-1': '#974fab',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/de/14/fe/de14fe3a0837dd198411c12b16d3278e.gif',
          'https://i.pinimg.com/originals/29/38/f6/2938f6668e8b7abde0350f9a64a011eb.gif',
          'https://i.pinimg.com/originals/41/f1/d2/41f1d2563876646fe57f3345be41b194.gif',
          'https://i.pinimg.com/originals/d2/30/57/d2305791aff7446352e3ced67d40318c.gif',
          'https://i.pinimg.com/originals/b3/74/d8/b374d881b4a02e4b5de07b42be54dd99.gif',
          'https://i.pinimg.com/originals/2f/47/52/2f4752601e7e1807cc80b9fcb05e2a63.gif',
        ],
        card_colors: ['#338132'],
        custom_font: { family: "'Rajdhani'", link: 'Rajdhani:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/2f/47/52/2f4752601e7e1807cc80b9fcb05e2a63.gif',
    },
    {
      color: 'blue',
      score: 3440,
      title: 'Rain by Lekagi',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#14181d',
          'background-1': '#1a2026',
          'background-2': '#212930',
          borders: '#2e3943',
          links: '#9ab5d6',
          sidebar:
            'linear-gradient(#2e3943c7, #14181dc7), center url("https://wallpapercrafter.com/th800/396699-Anime-City-Phone-Wallpaper.png")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.gifer.com/LoBm.gif',
          'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/2388c2fd-04eb-4c74-a88c-24caa2bd5f0d/dcy79k6-76b3b945-2b9b-46ba-b901-351419af73c4.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzIzODhjMmZkLTA0ZWItNGM3NC1hODhjLTI0Y2FhMmJkNWYwZFwvZGN5NzlrNi03NmIzYjk0NS0yYjliLTQ2YmEtYjkwMS0zNTE0MTlhZjczYzQuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.DX9008nvT0wyY9jzA7GaancWM8Kx8EuxrD63g7TrKT8',
          'https://media1.tenor.com/m/0uDfc8UDPVMAAAAd/anime-rain.gif',
          'https://c.tenor.com/TCuck5iIIH4AAAAC/rain-anime-rain.gif',
          'https://media.giphy.com/media/IuVFGSQZTd6TK/giphy.gif',
        ],
        card_colors: [
          '#e7e6f7',
          '#e3d0d8',
          '#aea3b0',
          '#827081',
          '#c6d2ed',
          '#e7e6f7',
          '#e3d0d8',
          '#aea3b0',
          '#827081',
          '#c6d2ed',
          '#e7e6f7',
          '#e3d0d8',
        ],
        custom_font: { family: "'Quicksand'", link: 'Quicksand:wght@400;700' },
      },
      preview: 'https://media1.tenor.com/m/0uDfc8UDPVMAAAAd/anime-rain.gif',
    },
    {
      color: 'lightgreen',
      score: 4440,
      title: 'RainyDay by DairyQueen',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e4ecdf',
          'background-1': '#3a4937',
          'background-2': '#b3bda3',
          borders: '#233134',
          links: '#3c443c',
          sidebar: '#3a4937',
          'sidebar-text': '#a7b18c',
          'text-0': '#a7b18c',
          'text-1': '#688967',
          'text-2': '#253224',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/4c/6b/f1/4c6bf114c204c417dfc0edcca8f67426.gif',
          'https://i.pinimg.com/originals/f0/c2/64/f0c264e5f18ee610c88ca829cd46f32e.gif',
          'https://i.redd.it/d1b9uc3yrzx81.gif',
          'https://preview.redd.it/0w8k67nd28971.gif?width=500&auto=webp&s=f5182e498e9e0c1cc8be9dd5e86d77783c9a7897',
          'https://animesher.com/orig/1/169/1699/16997/animesher.com_cute-aesthetic-pixels-1699788.gif',
        ],
        card_colors: [
          '#eaac8b',
          '#e56b6f',
          '#b56576',
          '#6d597a',
          '#355070',
          '#eaac8b',
          '#e56b6f',
          '#b56576',
          '#6d597a',
          '#355070',
          '#eaac8b',
          '#e56b6f',
        ],
        custom_font: { family: "'Rubik'", link: 'Rubik:wght@400;700' },
      },
      preview: 'https://i.redd.it/d1b9uc3yrzx81.gif',
    },
    {
      color: 'lightblue',
      score: 4440,
      title: 'DreamyBlue by HMR_YRK',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fafafa',
          'background-1': '#ffffff',
          'background-2': '#ffffff',
          borders: '#ffffff',
          links: '#b3c4c6',
          sidebar: 'linear-gradient(#7e9fb4, #ffffff)',
          'sidebar-text': '#ffffff',
          'text-0': '#7f9a9f',
          'text-1': '#7f9a9f',
          'text-2': '#7f9a9f',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/bb/88/12/bb881211bc616aa8609ea1852d70765e.jpg',
          'https://i.pinimg.com/736x/da/2e/3b/da2e3b9aaa5db32de943c5ef34e93e32.jpg',
          'https://i.pinimg.com/736x/24/33/c0/2433c0c85625de8b0e18f7cb05e91c2d.jpg',
          'https://i.pinimg.com/736x/f8/9d/b7/f89db74e2029220106baa720102b32a1.jpg',
          'https://i.pinimg.com/564x/2c/41/27/2c4127cb5474091370fec52b2bd6eab2.jpg',
          'https://i.pinimg.com/736x/d6/4c/cb/d64ccb8a004edfe57902908838bdfdee.jpg',
          'https://i.pinimg.com/564x/45/c0/03/45c003117f71f4983e27caf0d849b1cd.jpg',
          'https://i.pinimg.com/564x/7b/16/1d/7b161de21b7190977c898adf4838418c.jpg',
          'https://i.pinimg.com/564x/86/a0/c0/86a0c0bbe2d01c9db8bfa683987a82d2.jpg',
          'https://i.pinimg.com/564x/d2/fe/53/d2fe53bc74eb130e8127285e3ea6d489.jpg',
          'https://i.pinimg.com/564x/e2/08/36/e20836d3302746466ec1ad4ed5c8ee81.jpg',
          'https://i.pinimg.com/564x/7e/66/84/7e6684f737c9163afad557191d0fcab1.jpg',
          'https://i.pinimg.com/564x/39/06/5a/39065a7155d5ce64b8bbd83e5424ab6e.jpg',
          'https://i.pinimg.com/564x/ae/c7/0f/aec70f2f0de38d5e9605e1dd9ecdb66c.jpg',
          'https://i.pinimg.com/564x/e8/31/aa/e831aac85f7ccc71317b28d2054cc7f2.jpg',
          'https://i.pinimg.com/564x/74/70/00/747000426a798b17ef76e44058e73429.jpg',
          'https://i.pinimg.com/564x/59/f6/ab/59f6abc4fa1cd2bda7dc01be2b2d9a89.jpg',
          'https://i.pinimg.com/564x/3e/1c/97/3e1c971c60e8fe7aad2e78190a189963.jpg',
        ],
        card_colors: [
          '#a5c8cc',
          '#a7c8cc',
          '#a8c7cd',
          '#aac7cd',
          '#acc7cd',
          '#adc6ce',
          '#afc6ce',
          '#b0c5ce',
          '#b2c5cf',
          '#b4c5cf',
          '#b5c4cf',
          '#b7c4d0',
          '#b8c3d0',
          '#bac3d0',
          '#bcc3d1',
          '#bdc2d1',
          '#bfc2d1',
          '#c1c2d2',
        ],
        custom_font: { family: "'Quicksand'", link: 'Quicksand:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/74/70/00/747000426a798b17ef76e44058e73429.jpg',
    },
    {
      color: 'lightblue',
      score: 4440,
      title: 'Blue by Victoria',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#dbdef5',
          'background-1': '#f5f5f5',
          'background-2': '#d4d4d4',
          borders: '#61879e',
          links: '#000000',
          sidebar:
            'linear-gradient(#568fb3c7, #568fb3c7), center url("https://assets.wfcdn.com/im/12180920/resize-h210-w210%5Ecompr-r85/1605/160598239/Gray+Rumley+Mid-Century+Peel+%26+Stick+Geometric+Wallpaper.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#546596',
          'text-1': '#000000',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSoxs9-B8aS6j9h93iCtWysFWnkqjd4KdT4JcSxwGqzjQ&s',
          'https://i.pinimg.com/originals/a5/cd/fc/a5cdfc6cb2298873c1e9a42622d4316e.jpg',
          'https://img.wattpad.com/1f51c6e01795e19ccd6d27f1ceffd48ba5453eca/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f73614a495644677857376b4662673d3d2d3735333032363936342e313561646261303932356138373662663237393537343935343932362e6a7067?s=fit&w=720&h=720',
          'https://i.pinimg.com/736x/b0/bc/81/b0bc81b19a6bbd24bf0cc651fb538b0a.jpg',
          'https://i.pinimg.com/236x/16/74/92/16749213240910732da96138bac7b6df.jpg',
          'https://i.pinimg.com/236x/c3/2d/34/c32d340908f46251a826f5c240d1a84e.jpg',
        ],
        card_colors: ['#61879e'],
        custom_font: {
          family: "'Patrick Hand'",
          link: 'Patrick+Hand:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/236x/16/74/92/16749213240910732da96138bac7b6df.jpg',
    },
    {
      color: 'black',
      score: 4240,
      title: 'Blade by Anonymous',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0a0a0f',
          'background-1': '#1e1e1e',
          'background-2': '#262626',
          borders: '#3c3c3c',
          links: '#767676',
          sidebar: '#1e1e1e',
          'sidebar-text': '#f5f5f5',
          'text-0': '#501b13',
          'text-1': '#ffffff',
          'text-2': '#e6e6e6',
        },
        custom_cards: [
          'https://64.media.tumblr.com/ef826eee550e22b460329048307655bd/2acab9f4c7418295-d4/s1280x1920/f042be5e7dade5704e32fe747f9726e56c22c9e8.jpg',
          'https://i.pinimg.com/736x/2a/e0/5e/2ae05e5e33da327321ae6070d4ab37c7.jpg',
          'https://64.media.tumblr.com/c7f9996d120da1ba3ba7f5c6d0fa0add/2acab9f4c7418295-d4/s540x810/d768d0e986546b6b538313aaa2a93aeb195bfbab.jpg',
          'https://i.pinimg.com/736x/ce/e3/57/cee3575bb28dce562e772f48f4caedc8.jpg',
          'https://64.media.tumblr.com/7cafc5cc50ed0916e66909de9a0a2d9a/2acab9f4c7418295-b9/s540x810/a5e9a36f0c1d6ab2519ddd7e2b2ed91f8d14ed0d.jpg',
          'https://64.media.tumblr.com/f3fb34aba8473f7624e6543ec0531efd/2acab9f4c7418295-49/s540x810/582f6c84abcc60b89b3366f86f13156796c2f7b8.jpg',
          'https://64.media.tumblr.com/e0e5833be7d88a136e739315def6134b/2acab9f4c7418295-5c/s1280x1920/f2cdcab81cc9bf2026269ab168810630990c1a54.jpg',
          'https://64.media.tumblr.com/3a669eecdfe1498f060c710a2c5c73c4/2acab9f4c7418295-f8/s1280x1920/31a5a7d6180955eb689b936304f2edc3dc6b86cd.jpg',
          'https://64.media.tumblr.com/cdff246c05578d5ec264d6ed596411b8/2acab9f4c7418295-97/s1280x1920/9fcc4d9df81ccb2d7d842e68788a3fe19f46c428.jpg',
          'https://64.media.tumblr.com/d637c38afb03bc6d84f2bcc6b194520b/2acab9f4c7418295-a1/s1280x1920/1196b34fd0da42286045a467fd98f300e2ae415f.jpg',
          'https://i.pinimg.com/736x/3d/38/1e/3d381ee57b96a37c3d0578b2741d0e3b.jpg',
        ],
        card_colors: ['#767676'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://64.media.tumblr.com/c7f9996d120da1ba3ba7f5c6d0fa0add/2acab9f4c7418295-d4/s540x810/d768d0e986546b6b538313aaa2a93aeb195bfbab.jpg',
    },
    {
      color: 'gray',
      score: 2430,
      title: 'Bluey by Najah',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0d0d0c',
          'background-1': '#0e0e10',
          'background-2': '#2e271e',
          borders: '#bd8a00',
          links: '#fed090',
          sidebar: '#cc8b00',
          'sidebar-text': '#000000',
          'text-0': '#cf6a17',
          'text-1': '#fcfcfc',
          'text-2': '#d6d6d6',
        },
        custom_cards: [
          'https://media.giphy.com/media/W50PF9ZBO9gHzaCNhD/giphy.gif?cid=790b7611iiz01gfh9ujryxns0wslay9ir48bt05fblwlqse4&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/cNrHE8vu2T5lQ1Wz3t/giphy.gif?cid=ecf05e4749lnto8t24iti2suqyjmskirkdqurokzj7ve3qep&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/Zcp6CVTCTkv5lyDOnR/giphy.gif?cid=ecf05e474ra6n9kiricojkpfonejbxugtgvz6p77n86isxc1&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/UurFsM0xzNPtdXBi7N/giphy.gif?cid=790b7611hytuzdz3nbqhwjq4rozv3kfqobxzz3guygn92vit&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/KebQuvKzVnMrwbaGf9/giphy.gif?cid=790b761170xg8dr5crjqoao5e84h5jekfmk0j508eii8mqt4&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/fX2jDeRShmnSI899XJ/giphy.gif?cid=790b76112p048imgk69h0123bt6k820b0mzr20499uwxbzlx&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/SqO7ejLPyNbvTcID1G/giphy.gif?cid=790b76117puyczpbedk4dz99cc929psj0e4k31gl3lulwrds&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/jR4qTrQOQ3wNDFtLHr/giphy.gif?cid=790b7611iiz01gfh9ujryxns0wslay9ir48bt05fblwlqse4&ep=v1_gifs_search&rid=giphy.gif&ct=g',
        ],
        card_colors: [
          '#ffc971',
          '#ffb627',
          '#ff9505',
          '#e2711d',
          '#cc5803',
          '#ffc971',
          '#ffb627',
          '#ff9505',
        ],
        custom_font: { family: "'Cinzel'", link: 'Cinzel:wght@400;700' },
      },
      preview:
        'https://media.giphy.com/media/Zcp6CVTCTkv5lyDOnR/giphy.gif?cid=ecf05e474ra6n9kiricojkpfonejbxugtgvz6p77n86isxc1&ep=v1_gifs_search&rid=giphy.gif&ct=g',
    },
    {
      color: 'black',
      score: 4320,
      title: 'MCI by Duc',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#1a1a1a',
          borders: '#272727',
          links: '#5dbdf9',
          sidebar: 'linear-gradient(#ade8f4, #ffffff)',
          'sidebar-text': '#000000',
          'text-0': '#f1f1f3',
          'text-1': '#65bfec',
          'text-2': '#030303',
        },
        custom_cards: [
          'https://media2.giphy.com/media/fTepcSD0oSvF81VUqd/200w.gif?cid=6c09b952amcuri6px1enf3bytazv3x55fro74sv2jv489j89&ep=v1_gifs_search&rid=200w.gif&ct=g',
          'https://64.media.tumblr.com/da5fbb5c6029d7087f66d8e09f72b1cd/tumblr_pe98bhLQy51w50dq4o5_r1_500.gifv',
          'https://media3.giphy.com/media/SrkUm5GCwK3Hzu43MF/200w.gif?cid=6c09b9527fzylwjhsnvnjpijq8s68i6vtoo5wlntatb51h72&ep=v1_gifs_search&rid=200w.gif&ct=g',
          'https://media0.giphy.com/media/UygWiWMQZE6WifSQWE/200w.gif?cid=6c09b952tgg3j1kkxo47sn9hf9ok1f0l78pl5112ov6lwzvq&ep=v1_gifs_search&rid=200w.gif&ct=g',
          'https://media1.giphy.com/media/KUIKRWx2SPzvzgtDo9/200w.gif?cid=6c09b952fp1zzcmrsg3xjqsq1olfrmrdqbxtvw984xyogru6&ep=v1_gifs_search&rid=200w.gif&ct=g',
          'https://64.media.tumblr.com/e008725c210dfb42647b85df68fa2d7d/29814a1eaa638ac3-da/s500x750/445f93e8aa228d2e8e003e538e66c173fb216640.gif',
          'https://media.tenor.com/kLbMsBrP4u4AAAAM/manchester-city-julian-alvarez.gif',
          'https://media.tenor.com/YAVshE7AtEsAAAAM/ederson-pep.gif',
          'https://media1.giphy.com/media/ZOctk3DFgYrFKRV1TF/200w.gif?cid=6c09b952jtgv5vgtei5wzcutjy8ls3nupxo1yem1wvd8i64d&ep=v1_gifs_search&rid=200w.gif&ct=g',
        ],
        card_colors: [
          '#ade8f4',
          '#90e0ef',
          '#48cae4',
          '#00b4d8',
          '#0096c7',
          '#ade8f4',
          '#90e0ef',
          '#48cae4',
          '#00b4d8',
          '#0096c7',
        ],
        custom_font: {
          family: "'Happy Monkey'",
          link: 'Happy+Monkey:wght@400;700',
        },
      },
      preview:
        'https://media2.giphy.com/media/fTepcSD0oSvF81VUqd/200w.gif?cid=6c09b952amcuri6px1enf3bytazv3x55fro74sv2jv489j89&ep=v1_gifs_search&rid=200w.gif&ct=g',
    },
    {
      color: 'green',
      score: 4430,
      title: 'Gator by Owen',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#022211',
          'background-1': '#124b06',
          'background-2': '#143e04',
          borders: '#072c02',
          links: '#7CF3CB',
          sidebar: 'linear-gradient(#04390f, #0b9841)',
          'sidebar-text': '#44ff00',
          'text-0': '#9bf613',
          'text-1': '#23ec09',
          'text-2': '#0ee00b',
        },
        custom_cards: [
          'https://media.npr.org/assets/img/2016/05/20/ap_16140663259417-7aae704a1ea8ab0e509f8064e664b2ab8b6de9a8.jpg',
          'https://drb960u7vv58y.cloudfront.net/resize/388010/1200/627/image.jpg',
          'https://www.theonlinezoo.com/img/06/toz06729l.jpg',
          'https://www.theonlinezoo.com/img/06/toz06729l.jpg',
          'http://i.ytimg.com/vi/_FRrQ2TAp3Q/maxresdefault.jpg',
          'https://www.theonlinezoo.com/img/06/toz06728l.jpg',
          'https://news.griffith.edu.au/wp-content/uploads/2018/06/animal-animal-photography-crocodile-60644-1.jpg',
          'https://www.australiangeographic.com.au/wp-content/uploads/2018/07/saltwater-crocodile.jpg',
          'https://s-i.huffpost.com/gen/2709854/images/o-GOLF-GATOR-facebook.jpg',
          'https://upload.wikimedia.org/wikipedia/commons/e/e0/Alligator%2C_Florida.jpg',
        ],
        card_colors: [
          '#158f19',
          '#1a901a',
          '#1f911b',
          '#24921c',
          '#29941d',
          '#2e951e',
          '#33961f',
          '#389720',
          '#3d9821',
          '#439a23',
        ],
        custom_font: {
          family: "'Nanum Myeongjo'",
          link: 'Nanum+Myeongjo:wght@400;700',
        },
      },
      preview:
        'https://drb960u7vv58y.cloudfront.net/resize/388010/1200/627/image.jpg',
    },
    {
      color: 'pink',
      score: 4330,
      title: 'Rosemary by Madeline',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f5b7b7',
          'background-1': '#f5b7b7',
          'background-2': '#f5b7b7',
          borders: '#aa7d7d',
          links: '#bb7777',
          sidebar: '#f5b7b7',
          'sidebar-text': '#bb7777',
          'text-0': '#bb7777',
          'text-1': '#bb7777',
          'text-2': '#bb7777',
        },
        custom_cards: [
          'https://www.pockettactics.com/wp-content/sites/pockettactics/2023/02/tower-of-god-tier-list-3.jpg',
          'https://pbs.twimg.com/media/E1y40hpXsAMxd3E.jpg:large',
          'https://www.gamespot.com/a/uploads/screen_kubrick/1581/15811374/4032493-towerofgod.jpg',
          'https://pbs.twimg.com/media/EY_dEFvXsAAD_87.jpg:large',
          'https://forumcdn.ngelgames.com/board/image/17332773-81c0-426b-89f5-70771a5734d2.png',
          'https://forumcdn.ngelgames.com/board/image/adba0314-e50a-4fe2-9553-eed10a370c4a.png',
          'https://pbs.twimg.com/media/F2WF4QebUAAR62_.jpg:large',
          'https://i.pinimg.com/originals/83/d9/aa/83d9aa54aa52b58943bcb94f168960b7.jpg',
          'https://dlhc.ngelgames.net/e/wbpc_23012003.png',
          'https://www.pockettactics.com/wp-content/sites/pockettactics/2023/02/tower-of-god-tier-list-3.jpg',
        ],
        card_colors: ['#f5b7b7'],
        custom_font: {
          family: "'Nanum Myeongjo'",
          link: 'Nanum+Myeongjo:wght@400;700',
        },
      },
      preview: 'https://pbs.twimg.com/media/EY_dEFvXsAAD_87.jpg:large',
    },
    {
      color: 'purple',
      score: 4240,
      title: 'Anime by Joseph',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#69368a',
          'background-1': '#7b3ba5',
          'background-2': '#0f0fd7',
          borders: '#4f5463',
          links: '#1c31d4',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://i.pinimg.com/564x/b0/df/9a/b0df9a63835210afc4eefd5261b327fe.jpg")',
          'sidebar-text': '#7f849c',
          'text-0': '#2f0fa3',
          'text-1': '#450693',
          'text-2': '#a6e3a1',
        },
        custom_cards: [
          'https://i.ytimg.com/vi/yz-uktixvKQ/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGEEgJCh_MA8=&rs=AOn4CLB7XcPnT6UPbbZxG-aOvEvC6Pw0-A',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkMtWMviHBVKAFDXZFpZyUmAKhgbxM0qh-jQ&s',
          'https://i.ytimg.com/vi/zTK9DhM6OQc/maxresdefault.jpg?sqp=-oaymwEmCIAKENAF8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGBMgKih_MA8=&rs=AOn4CLB5YisbuXESPYSCm-ww13syvjG_Lg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUyoctSB_3msf9b3QRKjGR20o2pVfNBAHaOw&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeXuBLNpaNEnaLyCllQFh3ep4czJ5oI_tYChgsmM99Pw&s',
        ],
        card_colors: ['#c3b1e1'],
        custom_font: { family: "'Lora'", link: 'Lora:wght@400;700' },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTkMtWMviHBVKAFDXZFpZyUmAKhgbxM0qh-jQ&s',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'AyaMaruyama by nothrch',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#F6E1DC',
          'background-1': '#e6d6dc',
          'background-2': '#e6dbdb',
          borders: '#d7a8b8',
          links: '#7d6476',
          sidebar:
            'linear-gradient(#462b34c7, #b9acacc7), center url("https://i.bandori.party/u/c/transparent/3175Aya-Maruyama-Power-Enjoying-University-Student-Life-jymtZa.png")',
          'sidebar-text': '#ffffff',
          'text-0': '#815246',
          'text-1': '#3a3131',
          'text-2': '#644a4a',
        },
        custom_cards: [
          'https://preview.redd.it/ayas-5-dreamfes-trained-card-v0-ni7wgpxna8na1.jpg?auto=webp&s=762fcf1342de5428cf5a1fa8808a8c3f60597b13',
          'https://i.pinimg.com/736x/0c/09/54/0c09541ea4c6caa5a295cb24ab57da85.jpg',
          'https://i.pinimg.com/736x/b6/e4/0a/b6e40a4b83e642be6907f5f9e2c714a1.jpg',
          'https://pbs.twimg.com/media/FlDw6jZagAAOQzB.png:large',
          'https://i.pinimg.com/originals/ed/57/43/ed5743048c28334cd5a67970037f43a6.png',
          'https://i.bandori.party/u/c/art/2019Aya-Maruyama-Happy-FxZW3U.png',
          'https://bestdori.com/assets/en/characters/resourceset/res016067_rip/card_after_training.png',
          'https://i.bandori.party/u/c/art/a/2019Aya-Maruyama-Happy-s8akLh.png',
          'https://i.pinimg.com/originals/85/25/80/852580e343f9ffd156f6242aec85ba3e.png',
          'https://bestdori.com/assets/en/characters/resourceset/res016043_rip/card_after_training.png',
          'https://pbs.twimg.com/media/FNljRLYVIAUkvbk.png',
          'https://bestdori.com/assets/en/characters/resourceset/res016024_rip/card_after_training.png',
          'https://bestdori.com/assets/jp/characters/resourceset/res016033_rip/card_after_training.png',
          'https://bestdori.com/assets/en/characters/resourceset/res016047_rip/card_after_training.png',
          'https://bestdori.com/assets/en/characters/resourceset/res016039_rip/card_after_training.png',
        ],
        card_colors: [
          '#716b67',
          '#716465',
          '#836e75',
          '#3c4f36',
          '#637579',
          '#6b7185',
          '#716b67',
          '#716465',
          '#836e75',
          '#637579',
          '#6b7185',
          '#716b67',
          '#716465',
          '#836e75',
          '#637579',
          '#6b7185',
          '#716b67',
          '#716465',
        ],
        custom_font: {
          family: "'Montserrat'",
          link: 'Montserrat:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/736x/b6/e4/0a/b6e40a4b83e642be6907f5f9e2c714a1.jpg',
    },
    {
      color: 'black',
      score: 4441,
      title: 'Psycadelia by Bella',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#2c6a72',
          'background-2': '#91b62b',
          borders: '#6747f5',
          links: '#ff147a',
          sidebar:
            'linear-gradient(#101010c7, #101010c7), center url("https://i.pinimg.com/564x/e4/72/45/e47245505cb601f2f33cb533051cebfa.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#f5f5f5',
          'text-1': '#ffd747',
          'text-2': '#53b937',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/18/31/b3/1831b3cb6bed9ce5ed92d36ba8cd0e7f.jpg',
          'https://i.pinimg.com/564x/6e/ac/8e/6eac8e92dbfc8c35ad92d31d50871750.jpg',
          'https://i.pinimg.com/564x/04/72/b9/0472b91305c72c4502dcd9efda6e1f4f.jpg',
          'https://i.pinimg.com/564x/33/49/25/3349255ec3445c5455fcae0e6842dfca.jpg',
          'https://i.pinimg.com/564x/40/9a/e1/409ae1990dfb697cb01cedb4d19fcf0a.jpg',
          'https://i.pinimg.com/564x/62/58/8a/62588ad6a7b5fc75007d7cbf5ba990ac.jpg',
          'https://i.pinimg.com/564x/db/13/cd/db13cd86ebe246c5e7c57a4ae1bc2d0d.jpg',
          'https://i.pinimg.com/564x/83/3f/e1/833fe1874668d62f8d0a6a1e9cb32c5c.jpg',
          'https://i.pinimg.com/564x/59/3e/9c/593e9cfd783b1a23280520414cda2ed6.jpg',
          'https://i.pinimg.com/564x/7e/29/77/7e2977fef17655da280b1b43195bb7f0.jpg',
        ],
        card_colors: [
          '#267282',
          '#d53825',
          '#1bb0b7',
          '#c94b43',
          '#8ebaa6',
          '#4c8cc4',
          '#267282',
          '#d53825',
          '#1bb0b7',
          '#c94b43',
          '#8ebaa6',
        ],
        custom_font: { family: "'Unbounded'", link: 'Unbounded:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/62/58/8a/62588ad6a7b5fc75007d7cbf5ba990ac.jpg',
    },
    {
      color: 'beige',
      score: 4430,
      title: 'Dogs by Amelia',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fdf3e9',
          'background-1': '#f6c8a1',
          'background-2': '#f2ba8b',
          borders: '#9fb549',
          links: '#efb689',
          sidebar: 'linear-gradient(#ecceaac7, #523030c7), center url("")',
          'sidebar-text': '#ffffff',
          'text-0': '#2f1504',
          'text-1': '#a28267',
          'text-2': '#5c483d',
        },
        custom_cards: [
          'https://wallpapers.com/images/hd/labrador-puppy-photography-ju62uf5lwz4plyw6.jpg',
          'https://wallpapercave.com/wp/wp7757582.jpg',
          'https://mrwallpaper.com/images/high/labrador-retriever-puppy-desktop-ginhyt47nyjjpx6x.jpg',
          'https://img.freepik.com/premium-photo/golden-retriever-dog-field-flowers_917856-70.jpg',
          'https://wallpaperaccess.com/thumb/264291.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROzJj1Z5gwg_Qzif_K8uHkFonD_EoHASBXOV0XRegDyeCa7q-h_t-z33wikM93-JIJi6A&usqp=CAU',
          'https://wallpapers.com/images/hd/black-labrador-photoshoot-8mu12n7q45y7k23b.jpg',
        ],
        card_colors: [
          '#445412',
          '#445412',
          '#ccaea3',
          '#ccaea3',
          '#ccaea3',
          '#445412',
          '#6c5346',
          '#ccaea3',
          '#ccaea3',
          '#6c5346',
        ],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://img.freepik.com/premium-photo/golden-retriever-dog-field-flowers_917856-70.jpg',
    },
    {
      color: 'red',
      score: 4420,
      title: 'GirlInRed by Anon',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#6a0000',
          'background-1': '#1e1e1e',
          'background-2': '#262626',
          borders: '#3c3c3c',
          links: '#d3d3d3',
          sidebar: '#6a0000',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://images.sk-static.com/images/media/img/col4/20190124-144834-270943.jpg',
          'https://static.stereogum.com/uploads/2022/10/unnamed-70-1665775090-1000x1000.jpg',
          'https://images.genius.com/22c88a752300d6be375febf1151b119f.1000x1000x1.jpg',
          'https://static.tagthelove.com/cms/289_f6ff25051c2b15a6_1920box.jpg',
          'https://images.genius.com/ee3b2d963b1a009ddca3fab0ced4790c.1000x1000x1.jpg',
          'https://cdns-images.dzcdn.net/images/cover/50bda86d03e220138bb2afffcfe068a2/264x264.jpg',
          'https://cdns-images.dzcdn.net/images/cover/5eb3fbe2bda1a52c823e9048e193ecdf/264x264.jpg',
          '',
        ],
        card_colors: ['#f5f5f5'],
        custom_font: {
          family: "'Nanum Myeongjo'",
          link: 'Nanum+Myeongjo:wght@400;700',
        },
      },
      preview:
        'https://images.genius.com/ee3b2d963b1a009ddca3fab0ced4790c.1000x1000x1.jpg',
    },
    {
      color: 'black',
      score: 4330,
      title: 'Junko by angelbeea',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#ff0040',
          borders: '#ff0040',
          links: '#ff0040',
          sidebar:
            'linear-gradient(#000000c7, #ffffffc7), center url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbuKbJjg0R1OvfZxaxwZyJlhxRYcKuI9jwZ-5TIeMXsQ&s")',
          'sidebar-text': '#ff0040',
          'text-0': '#ff0000',
          'text-1': '#ff0040',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://64.media.tumblr.com/906df1164263e2d5f217afbc20b7b080/tumblr_ox0fm6kNSb1vy2tgqo4_400.jpg',
          'https://i.pinimg.com/736x/4f/3b/6a/4f3b6ab90d576bf6846616b7388b47be.jpg',
          'https://64.media.tumblr.com/b02971eaef6e86e1b05160ce21a2c551/649c30b29d85bf6b-4f/s540x810/ab45f11602eb541ba5a7d289fa409e23645c4e7b.jpg',
          'https://i1.sndcdn.com/artworks-f353vwxOZzQXhZlf-PDNIsw-t500x500.jpg',
          'https://i.pinimg.com/originals/14/45/49/144549d0006575c5c3c08880c7ca33c9.jpg',
          'https://characterai.io/i/300/static/avatars/uploaded/2023/5/8/GiPAja1Gm_NWu5Up2--3YYtqy-C12PgrwCdHuTIojNg.webp',
          'https://images6.fanpop.com/image/photos/37000000/Junko-Enoshima-icons-junko-enoshima-37094448-175-175.jpg',
        ],
        card_colors: [],
        custom_font: { family: "'Tektur'", link: 'Tektur:wght@400;700' },
      },
      preview:
        'https://64.media.tumblr.com/906df1164263e2d5f217afbc20b7b080/tumblr_ox0fm6kNSb1vy2tgqo4_400.jpg',
    },
    {
      color: 'blue',
      score: 2430,
      title: 'GaryLarson by Cardbord',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#273b44',
          'background-1': '#2e2e2e',
          'background-2': '#4e4e4e',
          borders: '#404040',
          links: '#f87777',
          sidebar: '#1e1e1e',
          'sidebar-text': '#fe8686',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/fe/50/7e/fe507e15c27269a59505917f3a2bad47.jpg',
          'https://i.pinimg.com/564x/d1/10/0c/d1100c0a7367eb10f4962f8189d19d65.jpg',
          'https://i.pinimg.com/736x/c4/16/c7/c416c71f014dcde9b3e768cd69bd0e65.jpg',
          'https://i.pinimg.com/564x/9c/f4/a9/9cf4a9550d0c95d4778358dfbb7839f7.jpg',
          'https://i.pinimg.com/736x/59/49/1d/59491dcc1924c2a5fb7f0884bada6654.jpg',
          'https://i.pinimg.com/564x/0e/37/01/0e3701a03ad9582e6a8d1e0e55aaeb8a.jpg',
          'https://static1.cbrimages.com/wordpress/wp-content/uploads/2024/04/the-far-side-penguin-slips-on-a-banana-peel.jpg',
        ],
        card_colors: ['#fe8686'],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/9c/f4/a9/9cf4a9550d0c95d4778358dfbb7839f7.jpg',
    },
    {
      color: 'blue',
      score: 4330,
      title: 'Fortnite by Chase',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#65a6d5',
          'background-1': '#62c064',
          'background-2': '#62c064',
          borders: '#624d2c',
          links: '#000000',
          sidebar: '#0f3257',
          'sidebar-text': '#62c064',
          'text-0': '#080402',
          'text-1': '#080402',
          'text-2': '#080402',
        },
        custom_cards: [
          'https://wallpapers.com/images/hd/cool-fortnite-missile-barrage-gvvhgse1rhfczzzb.jpg',
          'https://www.zleague.gg/theportal/wp-content/uploads/2023/07/Fortnite_cover_1-1140x570.jpg',
          'https://blogs-images.forbes.com/erikkain/files/2018/06/Fortnite.jpg',
          'https://bi.im-g.pl/im/1f/3c/19/z26461727AMP,-Fortnite--to-strzelanka--raczej-dla-starszakow--G.jpg',
          'https://cdn.vox-cdn.com/thumbor/qG3C-44HrE7iGFEhfr8FO_NDnEU=/0x0:1619x897/1200x800/filters:focal(681x320:939x578)/cdn.vox-cdn.com/uploads/chorus_image/image/59177933/battleroyaleactu.0.jpg',
        ],
        card_colors: ['#337e80', '#986c16', '#254284', '#177b63', '#177b63'],
        custom_font: { family: "'Rubik'", link: 'Rubik:wght@400;700' },
      },
      preview:
        'https://www.zleague.gg/theportal/wp-content/uploads/2023/07/Fortnite_cover_1-1140x570.jpg',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'SnoopyPochacco by Tofu',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e8dbc9',
          'background-1': '#c1aa90',
          'background-2': '#8a613d',
          borders: '#283618',
          links: '#9c8a77',
          sidebar:
            'linear-gradient(#b5ab3bc7, #b15988c7), center url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRZF2BK2p-BhyhqL1J9uxbN5FpWI0J8mxsMAA&s")',
          'sidebar-text': '#ffffff',
          'text-0': '#795635',
          'text-1': '#73563a',
          'text-2': '#a5a5a5',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/04/f9/a5/04f9a5b70b4bd04b6045baf1f6dc0d47.jpg',
          'https://i.pinimg.com/originals/63/a5/c4/63a5c4ac4605d66f13e0537cdd40fee8.gif',
          'https://i.pinimg.com/564x/34/a1/87/34a1878402980920a30954541b2eb4ee.jpg',
          'https://i.pinimg.com/564x/c0/e9/74/c0e9743735a91884bb04e52a876760a4.jpg',
          'https://i.pinimg.com/originals/51/c1/77/51c177681316fcd1421abff3461bf5a8.gif',
          'https://i.pinimg.com/originals/97/b1/6e/97b16ebb587aecabe86ea0e23a823079.gif',
          'https://i.pinimg.com/564x/9a/1f/83/9a1f832c9ced3a5088fe35ba8f4af514.jpg',
        ],
        card_colors: ['#9c8a77'],
        custom_font: {
          family: "'Expletus Sans'",
          link: 'Expletus+Sans:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/34/a1/87/34a1878402980920a30954541b2eb4ee.jpg',
    },
    {
      color: 'pink',
      score: 2320,
      title: 'Moody by liv',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fdddf4',
          'background-1': '#ffd1e4',
          'background-2': '#ff0066',
          borders: '#985bae',
          links: '#f54da6',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://64.media.tumblr.com/bd5736f70c97061f1e8a40a54e2ec218/tumblr_pa0p4nIe8U1qa9gmgo1_r1_1280.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#81bcea',
          'text-1': '#c18fff',
          'text-2': '#fd91e0',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/4e/9f/3c/4e9f3c18ef3fa6a5c9d5748b63f4be1a.jpg',
          'https://images.rove.me/w_1920,q_85/cnlnom1fxelbr4yhlven/san-francisco-fogs.jpg',
          'https://i.pinimg.com/736x/d0/60/2f/d0602fb4f4a24617b0d77e5d8ab98496.jpg',
        ],
        card_colors: [],
        custom_font: { family: "'Lora'", link: 'Lora:wght@400;700' },
      },
      preview:
        'https://images.rove.me/w_1920,q_85/cnlnom1fxelbr4yhlven/san-francisco-fogs.jpg',
    },
    {
      color: 'gray',
      score: 4340,
      title: 'Death Note by Dirk',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#1c1c21',
          'background-1': '#302d34',
          'background-2': '#121216',
          borders: '#0b0b0f',
          links: '#6d86c0',
          sidebar:
            'linear-gradient(#121216c7, #121216c7), center url("https://i.pinimg.com/564x/03/75/9a/03759ae58ef1f987e0923e4d44b7f73f.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#989bbd',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/85/7c/f2/857cf2caa058b977ae064ef69de9d149.jpg',
          'https://i.pinimg.com/564x/bb/92/a0/bb92a043ceedcf86cc06cfebd4697266.jpg',
          'https://i.pinimg.com/564x/59/3e/1a/593e1a9f4668324bd46a323c5c05f6ec.jpg',
          'https://i.pinimg.com/564x/4b/be/9d/4bbe9d85d474f04ab8fd5dff56f8529e.jpg',
          'https://i.pinimg.com/564x/fb/92/d7/fb92d764bd0df99a9c5963841ce89712.jpg',
          'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/e8656298-0a86-4c0b-8baf-ba534cee2d41/d6yjsh2-93cc45fc-2b77-4517-8284-909180db45d0.png?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2U4NjU2Mjk4LTBhODYtNGMwYi04YmFmLWJhNTM0Y2VlMmQ0MVwvZDZ5anNoMi05M2NjNDVmYy0yYjc3LTQ1MTctODI4NC05MDkxODBkYjQ1ZDAucG5nIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.IkWm_DG1HZ-J-moi0nb-bdAFp1bc-rO-Vcpn6FQYECg',
          'https://i.pinimg.com/564x/1a/88/0d/1a880d76f2632d43cc8ccacdea8939b3.jpg',
          'https://static.zerochan.net/DEATH.NOTE.full.725392.jpg',
          'https://i.pinimg.com/564x/d7/72/a3/d772a3ee27b2204b0ece72f85f4d637f.jpg',
          'https://i.pinimg.com/564x/5f/9b/4a/5f9b4a60aa5ced3dc2bfa54b4bef71b2.jpg',
          'https://i.pinimg.com/564x/ac/2d/f2/ac2df29c5a3a0e0e643b74a0a3b03289.jpg',
        ],
        card_colors: ['#3f434b'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://i.pinimg.com/564x/59/3e/1a/593e1a9f4668324bd46a323c5c05f6ec.jpg',
    },
    {
      color: 'black',
      score: 4440,
      title: 'Fallout by Seb',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#345b43',
          borders: '#8dee93',
          links: '#8dee93',
          sidebar: 'linear-gradient(#000000, #345b43)',
          'sidebar-text': '#8dee93',
          'text-0': '#8dee93',
          'text-1': '#8dee93',
          'text-2': '#8dee93',
        },
        custom_cards: [
          'https://66.media.tumblr.com/f552b45770937a9753a25e1c1e9f2c5a/tumblr_nq141xLbmA1riwt83o4_400.gifv',
          'https://i.gifer.com/origin/0f/0f38852678569e65b7144dc034659999_w200.gif',
          'https://64.media.tumblr.com/7d08ccb8ee71bec3d6f092346f6fe826/tumblr_nq141xLbmA1riwt83o5_500.gifv',
          'https://i.gifer.com/embedded/download/21vn.gif',
        ],
        card_colors: ['#8dee93'],
        custom_font: { family: "'Jersey 10'", link: 'Jersey+10:wght@400;700' },
      },
      preview:
        'https://66.media.tumblr.com/f552b45770937a9753a25e1c1e9f2c5a/tumblr_nq141xLbmA1riwt83o4_400.gifv',
    },
    {
      color: 'brown',
      score: 3240,
      title: 'Toothless by Aunicka',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#382100',
          'background-1': '#6d3908',
          'background-2': '#050410',
          borders: '#200200',
          links: '#ffffff',
          sidebar: 'linear-gradient(#ffdb36, #401509)',
          'sidebar-text': '#e2e8de',
          'text-0': '#401509',
          'text-1': '#ffffff',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/1c/fe/66/1cfe66897113832dcf18312b50eae197.jpg',
          'https://i.pinimg.com/originals/ef/13/1e/ef131e8da154bd39193b02042d7bbf55.jpg',
          'https://i.pinimg.com/originals/ad/2d/ac/ad2dac9226a689023382f58a192302d5.jpg',
          'https://i.pinimg.com/564x/7d/e0/35/7de0352e16c8d846c6d730046d89b3e7.jpg',
          'https://i.pinimg.com/474x/84/27/e4/8427e42de5599e6074d7605c68fca9dd.jpg',
          'https://i.pinimg.com/736x/f6/63/52/f6635225f24f4381173ea93186d0c182.jpg',
          'https://i.pinimg.com/474x/3f/19/39/3f1939e58c7941def6217d929cacf086.jpg',
          'https://i.pinimg.com/474x/8d/43/46/8d4346574d400021992c408e1aeebf31.jpg',
          'https://i.pinimg.com/564x/56/8d/3f/568d3fca78a31231393fcacd51a35595.jpg',
        ],
        card_colors: [
          '#3e463b',
          '#685735',
          '#93682f',
          '#bd7929',
          '#e88b23',
          '#3e463b',
          '#685735',
          '#93682f',
          '#bd7929',
        ],
        custom_font: { family: "'Karla'", link: 'Karla:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/474x/1c/fe/66/1cfe66897113832dcf18312b50eae197.jpg',
    },
    {
      color: 'black',
      score: 4240,
      title: 'Jordan by Elijah',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#9e0a0a',
          'background-2': '#ffffff',
          borders: '#ff3838',
          links: '#ec1818',
          sidebar: 'linear-gradient(#ff0f0fc7, #000000c7), center url("")',
          'sidebar-text': '#000000',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://www.bing.com/th/id/OGC.c3e45c9112a2b53cb3e89815d580efc2?pid=1.7&rurl=https%3a%2f%2fmedia.giphy.com%2fmedia%2fMIGL14bYRVGzm%2fgiphy.gif&ehk=4XMp89too6m8yp6nAO5dyWlhxAM8U%2fQT0qbdwR6jqe4%3d',
          'https://www.bing.com/th/id/OGC.0cfd1aa73496edd331bb7f85cc0473a8?pid=1.7&rurl=https%3a%2f%2fmedia.giphy.com%2fmedia%2frhpfWqKiuJft6%2fgiphy.gif&ehk=W1%2bQF8TAqv1VkZm%2flDFo%2bXAskAq0bZgMhUYG%2bxDK%2bLg%3d',
          'https://www.bing.com/th/id/OGC.07cc887cd858301a1b852e6002615f44?pid=1.7&rurl=https%3a%2f%2fmedia.giphy.com%2fmedia%2fQ84mfrhUf3JvO%2fgiphy.gif&ehk=rHLoKprTHAzlXeFRKlI7ebwHS9GG8bGhlI4znJS2cbI%3d',
          'https://www.bing.com/th/id/OGC.36a9c89e5478aef738f5ca9de0b2e8e0?pid=1.7&rurl=https%3a%2f%2fmedia1.tenor.com%2fimages%2f36a9c89e5478aef738f5ca9de0b2e8e0%2ftenor.gif%3fitemid%3d17176017&ehk=C9jr8Nh618vpv7gY%2bKo3WJQ8qmRwYcxRovOz%2f9btUa4%3d',
          'https://www.bing.com/th/id/OGC.af7f41b981d0bbf2c7f49bf14fca994d?pid=1.7&rurl=https%3a%2f%2fwww.icegif.com%2fwp-content%2fuploads%2f2022%2f05%2ficegif-1108.gif&ehk=yPH4SnPudR0MduB7iMebomN%2f8SukS6sZbnfTT5J9ug8%3d',
          'https://www.bing.com/th/id/OGC.e3e92f0da4efc88a075f093f27193efc?pid=1.7&rurl=https%3a%2f%2fd2u3dcdbebyaiu.cloudfront.net%2fuploads%2fatch_img%2f617%2f5a09bc9ada5ad54f1e1faf63e87aeaaf_a..gif&ehk=DP5%2fBYMGBMey%2fPwxNaU6B89sT86ub8aJp%2bCAkYEaPKU%3d',
          'https://www.bing.com/th/id/OGC.1f2d18514d2ff069c8400d35a1d4e203?pid=1.7&rurl=https%3a%2f%2fi.makeagif.com%2fmedia%2f7-13-2015%2fDKMghN.gif&ehk=SPnqzksnt6iFhUzHpDo3TjD6jiLLbHxxSerKBkwSmqU%3d',
          'https://www.bing.com/th/id/OGC.3a9e76e7a061a377a9145aef30274333?pid=1.7&rurl=https%3a%2f%2fwww.icegif.com%2fwp-content%2fuploads%2f2022%2f03%2ficegif-692.gif&ehk=zxXt5XY55X8UDJjmCNcvTaCl2HX6%2fI%2fFMEyn3TrdO6E%3d',
          'https://www.bing.com/th/id/OGC.5485391dc723d9aa2e90a7934237faad?pid=1.7&rurl=https%3a%2f%2fi.makeagif.com%2fmedia%2f6-26-2017%2fLvPgOS.gif&ehk=F%2frGopkMaEaZkDKIHOfWOaGFxCPlYT6YvYchm8%2bPYTA%3d',
        ],
        card_colors: [],
        custom_font: { family: "'Tektur'", link: 'Tektur:wght@400;700' },
      },
      preview:
        'https://www.bing.com/th/id/OGC.07cc887cd858301a1b852e6002615f44?pid=1.7&rurl=https%3a%2f%2fmedia.giphy.com%2fmedia%2fQ84mfrhUf3JvO%2fgiphy.gif&ehk=rHLoKprTHAzlXeFRKlI7ebwHS9GG8bGhlI4znJS2cbI%3d',
    },
    {
      color: 'orange',
      score: 4330,
      title: 'hamilton by sadpotato',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#EFDFC9',
          'background-1': '#e5b80b',
          'background-2': '#da9100',
          borders: '#ffbf00',
          links: '#da9100',
          sidebar: '#da9100',
          'sidebar-text': '#f5f5f5',
          'text-0': '#C57725',
          'text-1': '#D3995B',
          'text-2': '#210F04',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/c7/4a/60/c74a6050710367662de4d73de088b6e0.jpg',
          'https://miro.medium.com/v2/1*2eVh4W-PL5cRmhCWKURDqQ.png',
          'https://cdn.britannica.com/16/192716-050-7559ADC0/Hamilton-Lin-Manuel-Miranda-Rodgers-Theater-on-2016.jpg',
          'https://hips.hearstapps.com/hmg-prod/images/hamiltonaddl-04-975312f1-1594395142.jpeg',
          'https://trudymorgancole.files.wordpress.com/2016/06/hamilton-1.jpg',
        ],
        card_colors: [
          '#1e453e',
          '#306844',
          '#455b55',
          '#182c25',
          '#2c4c3b',
          '#1e453e',
          '#306844',
          '#455b55',
          '#182c25',
        ],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/c7/4a/60/c74a6050710367662de4d73de088b6e0.jpg',
    },
    {
      color: 'blue',
      score: 4430,
      title: 'Todoroki by Sheep',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0E3561',
          'background-1': '#516EE3',
          'background-2': '#4A63CA',
          borders: '#5C7BE5',
          links: '#A1B3EC',
          sidebar: 'linear-gradient(#000000, #071653)',
          'sidebar-text': '#ffffff',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#fff',
        },
        custom_cards: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKivcMOBPYSX_0E73LA8RvcXJ74TjLl-dfxeoDSaBm5Q&s',
          'https://i.ytimg.com/vi/ffWNXR0eWSM/maxresdefault.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfcltzi8DbE7n2aV2gCdXn06qNiRxek61Wq7uaRZFKaQ&s',
          'https://i.pinimg.com/originals/14/01/77/1401773babeddec3847729bd477c6bac.gif',
          'https://www.icegif.com/wp-content/uploads/2023/02/icegif-912.gif',
          'https://www.icegif.com/wp-content/uploads/2022/10/icegif-171.gif',
          'https://64.media.tumblr.com/56ee9860898e3cb00af80c35bf5edcff/cbf16b5082d2e68e-88/s540x810/15c119f2891b00d159c5693bcd7f020c1de05174.gif',
        ],
        card_colors: [
          '#41b5f3',
          '#90e0ef',
          '#000080',
          '#1770ab',
          '#71a3f6',
          '#41b5f3',
          '#24456a',
        ],
        custom_font: {
          family: "'Happy Monkey'",
          link: 'Happy+Monkey:wght@400;700',
        },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKivcMOBPYSX_0E73LA8RvcXJ74TjLl-dfxeoDSaBm5Q&s',
    },
    {
      color: 'black',
      score: 4320,
      title: 'Green by Luke',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#4dff00',
          'background-2': '#2bff00',
          borders: '#04ff00',
          links: '#00ff04',
          sidebar: 'linear-gradient(#000000, #59ff00)',
          'sidebar-text': '#020401',
          'text-0': '#59ff00',
          'text-1': '#11ff00',
          'text-2': '#9900ff',
        },
        custom_cards: [
          'https://i2.wp.com/www.lost-painters.nl/wp-content/uploads/tumblr_lj57cbqlq61qdk2oko1_500.gif?resize=500%2C282',
          'https://stardewcommunitywiki.com/mediawiki/images/a/a0/Slime_Ball_Anim.gif',
          'https://orig00.deviantart.net/092e/f/2015/139/4/f/green_fireball_animation_by_alexredfish-d8tz3c7.gif',
          'https://th.bing.com/th/id/R.a84aa1f9add090b91210643e6f2fdd4b?rik=8Tcu9IOMVgPbTw&pid=ImgRaw&r=0',
          'https://3.bp.blogspot.com/-cNH1H2vGzjY/V2BxuLQQR3I/AAAAAAAAABs/fUbnr2B6y1M8zeyoDI7Aqhp5GfyvdUAiwCK4B/s1600/tumblr_mlppqo1ggW1rsdpaso1_500.gif',
          'https://media.tenor.com/images/2025ba8f56a2941f3ba219ee81201eca/tenor.gif',
          'https://c.tenor.com/medDZymgJEkAAAAj/rainbow.gif',
        ],
        card_colors: [
          '#1f7500',
          '#1f7500',
          '#248700',
          '#227f00',
          '#195f00',
          '#113f00',
          '#081f00',
          '#000000',
        ],
        custom_font: { family: "'Rubik'", link: 'Rubik:wght@400;700' },
      },
      preview:
        'https://media.tenor.com/images/2025ba8f56a2941f3ba219ee81201eca/tenor.gif',
    },
    {
      color: 'blue',
      score: 2440,
      title: 'Furina by Aqua',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#1b1e58',
          'background-1': '#4858ce',
          'background-2': '#98bef3',
          borders: '#cad7f9',
          links: '#56Caf0',
          sidebar: 'linear-gradient(#5830c5, #ffecc5)',
          'sidebar-text': '#ffffff',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://img.uhdpaper.com/wallpaper/furina-genshin-impact-art-23@1@m-thumb.jpg?dl',
          'https://img.uhdpaper.com/wallpaper/furina-genshin-impact-art-21@1@m-thumb.jpg?dl',
          'https://img.uhdpaper.com/wallpaper/furina-neuvillette-genshin-impact-game-3@1@m-thumb.jpg?dl',
          'https://img.uhdpaper.com/wallpaper/genshin-impact-furina-art-13@1@m-thumb.jpg?dl',
          'https://img.uhdpaper.com/wallpaper/furina-genshin-impact-game-art-24@1@m-thumb.jpg?dl',
          'https://s.yimg.com/ny/api/res/1.2/Zf42mqkttmYqjdMAIJeDTg--/YXBwaWQ9aGlnaGxhbmRlcjt3PTY0MDtoPTM2MA--/https://s.yimg.com/os/creatr-uploaded-images/2023-11/cfe780e0-7a72-11ee-bfcb-9d2fa0d4df57',
          'https://img.uhdpaper.com/wallpaper/genshin-impact-furina-game-art-16@1@m-thumb.jpg?dl',
          'https://img.uhdpaper.com/wallpaper/neuvillette-furina-genshin-impact-art-4@1@m-thumb.jpg?dl',
          'https://img.uhdpaper.com/wallpaper/furina-genshin-impact-art-7@1@m-thumb.jpg?dl',
          'https://img.uhdpaper.com/wallpaper/furina-genshin-impact-video-game-6@1@m-thumb.jpg?dl',
          'https://img.uhdpaper.com/wallpaper/furina-genshin-impact-art-1@1@m-thumb.jpg?dl',
          'https://img.uhdpaper.com/wallpaper/furina-genshin-impact-art-25@1@m-thumb.jpg?dl',
        ],
        card_colors: [],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://img.uhdpaper.com/wallpaper/genshin-impact-furina-game-art-16@1@m-thumb.jpg?dl',
    },
    {
      color: 'gray',
      score: 2320,
      title: 'Half-Life2 by PootisPower',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#8a8a8a',
          'background-1': '#ffa200',
          'background-2': '#3c3934',
          borders: '#ffa200',
          links: '#ff9500',
          sidebar: 'linear-gradient(#000000, #ffae00)',
          'sidebar-text': '#000000',
          'text-0': '#ff7300',
          'text-1': '#000000',
          'text-2': '#737373',
        },
        custom_cards: [
          'https://cdn.cloudflare.steamstatic.com/half-life.com/images/halflife2/halflife2_2.jpg',
          'https://cdn.cloudflare.steamstatic.com/half-life.com/images/halflife2/halflife2_3.jpg',
          'https://cdn.cloudflare.steamstatic.com/half-life.com/images/halflife2/halflife2_4.jpg',
        ],
        card_colors: ['#ffa200'],
        custom_font: { family: "'Half-Life'", link: 'Half-Life:wght@400;700' },
      },
      preview:
        'https://cdn.cloudflare.steamstatic.com/half-life.com/images/halflife2/halflife2_3.jpg',
    },
    {
      color: 'lightgreen',
      score: 4441,
      title: 'AubeBlue by Stromboli',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e2eadd',
          'background-1': '#c6d7bd',
          'background-2': '#abc49d',
          borders: '#abc49d',
          links: '#748965',
          sidebar:
            'linear-gradient(#a5b39cc7, #a5b39cc7), center url("https://i.pinimg.com/736x/47/5c/1a/475c1aa9b647580f3ea6a7fad7b0bfb1.jpg")',
          'sidebar-text': '#718465',
          'text-0': '#748965',
          'text-1': '#748965',
          'text-2': '#748965',
        },
        custom_cards: [
          'https://wallpapercave.com/wp/wp9433282.jpg',
          'https://wallpapercave.com/wp/wp9433300.jpg',
          'https://wallpapercave.com/wp/wp9433293.jpg',
          'https://wallpapercave.com/wp/wp9433379.jpg',
          'https://wallpapercave.com/wp/wp9433368.png',
          'https://th.bing.com/th/id/R.9b2041f503e1e558e4d00799c50ad3bd?rik=Ook%2fil4ho%2fMOjg&pid=ImgRaw&r=0',
          'https://th.bing.com/th/id/OIP.t0L16FFEQVoWsqxbjuHV2gHaHu?rs=1&pid=ImgDetMain',
          'https://th.bing.com/th/id/OIP.fwD-aZ6f4edNQuKbxN3SSwHaG1?rs=1&pid=ImgDetMain',
        ],
        card_colors: ['#748965'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://i.pinimg.com/736x/47/5c/1a/475c1aa9b647580f3ea6a7fad7b0bfb1.jpg',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'MaxfieldParrish by Annabelle',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f4ede1',
          'background-1': '#e7d6cf',
          'background-2': '#dec6ba',
          borders: '#460c0c',
          links: '#932a2a',
          sidebar:
            'linear-gradient(#343850c7, #200303c7), center url("https://www.artrenewal.org/secureimages/artwork/314/314/91458/c1a6c251-bd18-4d6d-b5c9-80b28f479da1..jpg?format=jpg&mode=crop&width=350")',
          'sidebar-text': '#f4ede1',
          'text-0': '#200303',
          'text-1': '#932a2a',
          'text-2': '#932a2a',
        },
        custom_cards: [
          'https://i.ebayimg.com/images/g/39cAAOSwljNf-l1s/s-l1200.webp',
          'https://sothebys-com.brightspotcdn.com/8e/13/34b4b6f3448aa0ac1c27006e21a2/maxfield-parrish-mill-pond-crop-2.jpg',
          'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRaE6xdxiZqOWsyrnAzS7zCt6GriGpzA4kuAVL6UAbFPs_Npr0SVi-QtoX2Mb1DY1HGkDvoxrXaBPT2DZV0j5Q_ULScQpjJUZwnH8TwWC0&usqp=CAE',
          'https://www.artrenewal.org/secureimages/artwork/314/314/2757/hunt_farm-large.jpg?&format=jpg&mode=max&w=644',
          'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj1fXgrtVID03yRW4OHAr3RwkZ7quPGZTC8M7lajgsacdQ8o-EUBjNMYfNwoo1XgqMG-iXIHGkmohhDepHTWr0gbjTTi1Y8OFmeiHCDKR_0H6EgH92gzt2Oc0lqsChyphenhyphenagdHhAofsxYFrXY/s1000/unfinished.jpg',
          'https://i.pinimg.com/736x/f9/03/24/f903244ddf3876c10dea87fc8907995b.jpg',
          'https://pbs.twimg.com/media/GDx2aDmaUAAT6F-.jpg:large',
        ],
        card_colors: [
          '#154877',
          '#866486',
          '#8d591c',
          '#304331',
          '#510c15',
          '#932a2b',
          '#510c15',
        ],
        custom_font: {
          family: "'Nanum Myeongjo'",
          link: 'Nanum+Myeongjo:wght@400;700',
        },
      },
      preview:
        'https://encrypted-tbn3.gstatic.com/shopping?q=tbn:ANd9GcRaE6xdxiZqOWsyrnAzS7zCt6GriGpzA4kuAVL6UAbFPs_Npr0SVi-QtoX2Mb1DY1HGkDvoxrXaBPT2DZV0j5Q_ULScQpjJUZwnH8TwWC0&usqp=CAE',
    },
    {
      color: 'lightblue',
      score: 4440,
      title: 'SwanLake by PriyaN2026',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#9cb5d7',
          'background-2': '#6c83a3',
          borders: '#cccccc',
          links: '#cccccc',
          sidebar: '#cbddf5',
          'sidebar-text': '#cbddf5',
          'text-0': '#6d83a3',
          'text-1': '#516685',
          'text-2': '#394a65',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/12/23/63/1223634b77503a855083aebe32f5bdcd.jpg',
          'https://i.pinimg.com/564x/6d/fa/82/6dfa8241f70a8aa40cc225639f17c246.jpg',
          'https://i.pinimg.com/564x/a0/b8/7e/a0b87e8f1d03d06984980e11ed4c7d2f.jpg',
          'https://i.pinimg.com/564x/06/92/4f/06924f1bdc8d5ba27c02d805f256e5f7.jpg',
          'https://i.pinimg.com/564x/16/6f/2f/166f2fb74d11480fcb163c27e8794881.jpg',
          'https://i.pinimg.com/564x/83/42/ed/8342edbd9e65ddcfc3c516d0f46ccc5b.jpg',
          'https://i.pinimg.com/564x/0a/6d/13/0a6d1322a7f67c8975ef3636eb7f8c5a.jpg',
          'https://i.pinimg.com/564x/d9/ab/74/d9ab745fcea6d66ef37a3583803fab70.jpg',
          'https://i.pinimg.com/236x/0f/ad/81/0fad810613fdaefce169bc52872e9c8b.jpg',
          'https://i.pinimg.com/236x/e7/63/a9/e763a9dde21262f6d677778e9a3ec51f.jpg',
          'https://i.pinimg.com/564x/57/19/1f/57191faa6bb52741230205f99f3f7717.jpg',
        ],
        card_colors: ['#5e6989'],
        custom_font: { family: "'Comfortaa'", link: 'Comfortaa:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/12/23/63/1223634b77503a855083aebe32f5bdcd.jpg',
    },
    {
      color: 'lightblue',
      score: 2340,
      title: 'BeachBum by Bella',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#BFDDCE',
          'background-1': '#F4A24C',
          'background-2': '#F4A24C',
          borders: '#E86C4F',
          links: '#BFDDCE',
          sidebar: 'linear-gradient(#027A76, #F4A24C)',
          'sidebar-text': '#ffffff',
          'text-0': '#F4A24C',
          'text-1': '#027A76',
          'text-2': '#BFDDCE',
        },
        custom_cards: [
          'https://64.media.tumblr.com/4eb32f4ee77c86d448f270fc718abc2a/031c835da2403abc-d9/s500x750/e12803acbb1feb5cfc69ca862571ce597f3e904e.gifv',
          'https://64.media.tumblr.com/f624789cfdec76325756cac6c8cd3be3/cdef7fb0f905480c-8d/s250x400/42514dfe75f662387fbafcae4e231dd5d03eaf71.gifv',
          'https://64.media.tumblr.com/8d9769f4b209ee871656e8713c795457/cdef7fb0f905480c-51/s250x400/b9232d38f05be416f6acc48879a48a30acd6b0fb.gifv',
          'https://64.media.tumblr.com/faf2ba99f896d4417a9ca8b84d3b5588/cdef7fb0f905480c-29/s250x400/384afb4df391344a837a8e054e95d4f17faf522f.gifv',
        ],
        card_colors: ['#0b9be3', '#06a3b7', '#1770ab', '#4554a4'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://64.media.tumblr.com/8d9769f4b209ee871656e8713c795457/cdef7fb0f905480c-51/s250x400/b9232d38f05be416f6acc48879a48a30acd6b0fb.gifv',
    },
    {
      color: 'yellow',
      score: 4330,
      title: 'OnePiece by Elida',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f4f2cd',
          'background-1': '#8f8a8a',
          'background-2': '#000000',
          borders: '#454545',
          links: '#56Caf0',
          sidebar: '#000000',
          'sidebar-text': '#f5f5f5',
          'text-0': '#000000',
          'text-1': '#000000',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://images5.alphacoders.com/132/1329624.png',
          'https://external-preview.redd.it/QKRtrkuQUbAax7EIKL3V4Y0m7V08GUfB6XA83a-0D3Y.jpg?width=640&crop=smart&auto=webp&s=1e4a84ed46a9a805b683937559959dedeefdde10',
          'https://wallpapers.com/images/high/one-piece-anime-blue-and-white-7j3dilalibscyf4q.webp',
          'https://wallpapers.com/images/high/one-piece-anime-pirates-treasures-dpxai9k97bl23mvv.webp',
          'https://wallpapers.com/images/high/one-piece-anime-pirates-orange-sky-bxi22a7lzq54tn30.webp',
          'https://wallpapers.com/images/high/one-piece-anime-the-hearts-pirates-fx49vaua09gws5li.webp',
        ],
        card_colors: ['#56Caf0'],
        custom_font: { family: "'Comfortaa'", link: 'Comfortaa:wght@400;700' },
      },
      preview:
        'https://wallpapers.com/images/high/one-piece-anime-blue-and-white-7j3dilalibscyf4q.webp',
    },
    {
      color: 'lightblue',
      score: 4441,
      title: 'ayatakano by stink',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fffaf0',
          'background-1': '#f7eed9',
          'background-2': '#6f9086',
          borders: '#6f9086',
          links: '#8faea4',
          sidebar: '#6f9086',
          'sidebar-text': '#e7d8cb',
          'text-0': '#608076',
          'text-1': '#608076',
          'text-2': '#6f9086',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/8e/f2/c3/8ef2c3c889ab740d224ca8ba2df77be7.jpg',
          'https://i.pinimg.com/736x/e1/7c/45/e17c458053c4503d05b3fa70899015b2.jpg',
          'https://i.pinimg.com/474x/37/ca/de/37cade7c88d5c886102a5dab3136d7c9.jpg',
        ],
        card_colors: ['#8faea4'],
        custom_font: { family: "'Rubik'", link: 'Rubik:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/474x/37/ca/de/37cade7c88d5c886102a5dab3136d7c9.jpg',
    },
    {
      color: 'blue',
      score: 4441,
      title: 'Euphonium by Freedom',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0d1721',
          'background-1': '#0d0d21',
          'background-2': '#47462a',
          borders: '#565652',
          links: '#e2c99c',
          sidebar: '#060d13',
          'sidebar-text': '#7f849c',
          'text-0': '#d3b682',
          'text-1': '#b09d87',
          'text-2': '#ebc380',
        },
        custom_cards: [
          'https://media1.tenor.com/m/Ua-uAU-lBj8AAAAd/reina-kousaka-hibike-euphonium.gif',
          'https://media1.tenor.com/m/H2ES6q0_6sgAAAAC/fight-run-away.gif',
          'https://media1.tenor.com/m/zQFn04_fS1sAAAAC/kumiko-kumiko-oumae.gif',
          'https://media1.tenor.com/m/tX6DY13aU7EAAAAC/kumiko-hibike.gif',
          'https://media1.tenor.com/m/yCg1uNECG1MAAAAd/hibike-euphonium-reina.gif',
          'https://media1.tenor.com/m/PK_9qQ2P9joAAAAC/sound-euphonium-hibike-yufoniamu.gif',
          'https://media1.tenor.com/m/9y-DrT_MIt4AAAAd/hibike-eupho.gif',
          'https://media1.tenor.com/m/Jbwmn25qVuUAAAAC/hibike-euphonium.gif',
          'https://media1.tenor.com/m/UHB6XX56YHwAAAAC/hibike-euphonium.gif',
          'https://media1.tenor.com/m/1For8PuMVwoAAAAd/kumiko-oumae-kumiko.gif',
          'https://media1.tenor.com/m/15gAhrviiS4AAAAd/asuka-tanaka-kumiko-oumae.gif',
          'https://media1.tenor.com/m/CQiys_7hAssAAAAC/kanade-kanade-hisaishi.gif',
          'https://media1.tenor.com/m/VR4bGrOFOK4AAAAC/hisaishi-kanade-hisaishi.gif',
        ],
        card_colors: ['#ebc380'],
        custom_font: {
          family: "'EB Garamond'",
          link: 'EB+Garamond:wght@400;700',
        },
      },
      preview: 'https://media1.tenor.com/m/tX6DY13aU7EAAAAC/kumiko-hibike.gif',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'Sunset by Sterling',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fdefe7',
          'background-1': '#ffac80',
          'background-2': '#ffcd75',
          borders: '#78497e',
          links: '#fe5871',
          sidebar: 'linear-gradient(#ffac80, #430179)',
          'sidebar-text': '#ffffff',
          'text-0': '#43005c',
          'text-1': '#430179',
          'text-2': '#9b5cad',
        },
        custom_cards: [
          'https://wanderingcpa.files.wordpress.com/2019/06/original.gif?w=616',
          'https://i.imgur.com/R8IqkUE.gif',
          'https://favim.com/pd/p/orig/2019/04/04/gif-sunset-aesthetic-Favim.com-7034796.gif',
          'https://animesher.com/orig/1/192/1923/19235/animesher.com_gorgeous-flower-flowers-1923590.gif',
          'https://pa1.aminoapps.com/5779/eae7efb58cecbf6bd3e07a8c704446e9e066e424_hq.gif',
        ],
        card_colors: ['#eaac8b', '#e56b6f', '#b56576', '#6d597a', '#355070'],
        custom_font: { family: "'Quicksand'", link: 'Quicksand:wght@400;700' },
      },
      preview: 'https://i.imgur.com/R8IqkUE.gif',
    },
    {
      color: 'pink',
      score: 4340,
      title: 'CoralPink by Hadley',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffdcc7',
          'background-1': '#f9e5d7',
          'background-2': '#ff0066',
          borders: '#ff007b',
          links: '#ff0088',
          sidebar: '#f490b3',
          'sidebar-text': '#ffffff',
          'text-0': '#ff0095',
          'text-1': '#ff8f8f',
          'text-2': '#ff5c5c',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/52/87/9f/52879ffddb1d79ec57b11bcd0475a3ae.jpg',
          'https://www.shutterstock.com/blog/wp-content/uploads/sites/5/2021/06/Coral-Palette-Feature.jpg',
          'https://i.pinimg.com/736x/ae/17/71/ae1771f2f37d1f8e9825d69ffe6d2063.jpg',
          'https://www.shutterstock.com/blog/wp-content/uploads/sites/5/2021/06/shutterstock_1252125109.jpg?w=750',
          'https://i.pinimg.com/236x/79/ac/67/79ac6717bbcfb136c9900e6213c567ee.jpg',
          'https://qph.cf2.quoracdn.net/main-qimg-68f90b70a778ab7073b941ce1ba0481e.webp',
        ],
        card_colors: ['#ffdcc7'],
        custom_font: {
          family: "'Nanum Myeongjo'",
          link: 'Nanum+Myeongjo:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/236x/52/87/9f/52879ffddb1d79ec57b11bcd0475a3ae.jpg',
    },
    {
      color: 'blue',
      score: 1230,
      title: 'Dogs by Hadley',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#637a97',
          'background-1': '#364963',
          'background-2': '#212930',
          borders: '#212930',
          links: '#00bfff',
          sidebar:
            'linear-gradient(#211a25c7, #5a5140c7), center url("https://media4.giphy.com/media/KtrhyNGwNCSYM4pVRq/200w.gif?cid=6c09b952lszu4jh78yj8dxe0bjqrmcnrtohn3n11jlnc0dm6&ep=v1_gifs_search&rid=200w.gif&ct=g")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://media3.giphy.com/media/18trqWNZnu33q/200w.gif?cid=6c09b952onken3174fx0li71gdk5ptdctg8xk9dde7glnrqv&ep=v1_gifs_search&rid=200w.gif&ct=g',
          'https://i.pinimg.com/originals/6d/dd/4c/6ddd4ce926d537083c7ea5e737fbc020.gif',
          'https://media0.giphy.com/media/FnsbzAybylCs8/200w.gif?cid=6c09b952onken3174fx0li71gdk5ptdctg8xk9dde7glnrqv&ep=v1_gifs_search&rid=200w.gif&ct=g',
          'https://images.squarespace-cdn.com/content/v1/564f593ce4b0567eaa54acbc/1627807657303-NL8IEAR82S3NWRMRFXVI/giphy.gif',
          'https://38.media.tumblr.com/734f1b206636f59efc9bac356274bc32/tumblr_nf3had942F1s02vreo4_500.gif',
          'https://i.chzbgr.com/full/8487988224/hC655C7FC/funny-dog-gif-hot-doggy-with-a-hot-dog',
        ],
        card_colors: ['#637a97'],
        custom_font: { family: "'Cinzel'", link: 'Cinzel:wght@400;700' },
      },
      preview:
        'https://media3.giphy.com/media/18trqWNZnu33q/200w.gif?cid=6c09b952onken3174fx0li71gdk5ptdctg8xk9dde7glnrqv&ep=v1_gifs_search&rid=200w.gif&ct=g',
    },
    {
      color: 'orange',
      score: 4320,
      title: 'Pixeled by Hadley',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f46836',
          'background-1': '#eee78d',
          'background-2': '#eee78d',
          borders: '#f03f21',
          links: '#efce77',
          sidebar:
            'linear-gradient(#f33f20c7, #f33f20c7), center url("https://i.pinimg.com/originals/6a/d2/ee/6ad2ee191d434a996766b500a1eb197e.gif")',
          'sidebar-text': '#eee78d',
          'text-0': '#efce77',
          'text-1': '#f0c16c',
          'text-2': '#efc872',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/6a/d2/ee/6ad2ee191d434a996766b500a1eb197e.gif',
        ],
        card_colors: ['#f0c670'],
        custom_font: { family: "'Cinzel'", link: 'Cinzel:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/6a/d2/ee/6ad2ee191d434a996766b500a1eb197e.gif',
    },
    {
      color: 'pink',
      score: 4420,
      title: 'PinkShades by Rebecca',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f1e9e9',
          'background-1': '#ffe0ed',
          'background-2': '#f490b3',
          borders: '#ff007b',
          links: '#ff0066',
          sidebar: '#f490b3',
          'sidebar-text': '#ffffff',
          'text-0': '#ff0095',
          'text-1': '#ff0086',
          'text-2': '#ff0088',
        },
        custom_cards: ['none'],
        card_colors: [
          '#ff0a54',
          '#ff5c8a',
          '#ff85a1',
          '#ff99ac',
          '#fbb1bd',
          '#ff0a54',
          '#ff5c8a',
          '#ff85a1',
          '#ff99ac',
        ],
        custom_font: { family: "'Cinzel'", link: 'Cinzel:wght@400;700' },
      },
      preview:
        'https://htmlcolorcodes.com/assets/images/colors/hot-pink-color-solid-background-1920x1080.png',
    },
    {
      color: 'red',
      score: 4440,
      title: 'Crowley by inkadink',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#3c1616',
          'background-1': '#4d3232',
          'background-2': '#b25906',
          borders: '#c20505',
          links: '#d74242',
          sidebar: 'linear-gradient(#660505, #000000)',
          'sidebar-text': '#d2660f',
          'text-0': '#f0b000',
          'text-1': '#ffbb00',
          'text-2': '#ad7b25',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/c3/5b/08/c35b08cc514b226919d7a613dfde7b74.jpg',
          'https://i.pinimg.com/564x/ee/ef/69/eeef69c1a2927dff82db925086b4655a.jpg',
          'https://i.pinimg.com/564x/7d/31/d4/7d31d4353294bfee3738cfc3d58cbdfe.jpg',
          'https://i.pinimg.com/564x/8d/fc/11/8dfc11b5d408e26868e0027bd231f6d5.jpg',
        ],
        card_colors: ['#d74242'],
        custom_font: { family: "'DM Sans'", link: 'DM+Sans:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/8d/fc/11/8dfc11b5d408e26868e0027bd231f6d5.jpg',
    },
    {
      color: 'blue',
      score: 4440,
      title: 'Glacous by Ella',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#31406d',
          'background-1': '#495e88',
          'background-2': '#7982af',
          borders: '#bdd1ff',
          links: '#bac3e9',
          sidebar: '#425780',
          'sidebar-text': '#e2e8de',
          'text-0': '#b3c2d1',
          'text-1': '#c5c8d3',
          'text-2': '#688eac',
        },
        custom_cards: [
          'https://pm1.aminoapps.com/7880/8cf615594d505e57dd38ecea107d897950e02348r1-720-720v2_hq.jpg',
          'https://i.pinimg.com/736x/5e/63/58/5e6358a0bb95fcb65d9e9ffc1b33702b.jpg',
          'https://pm1.aminoapps.com/7880/5fb16d96fdcdad8b8691fe6524dc0cff535c0628r1-736-736v2_uhq.jpg',
          'https://64.media.tumblr.com/da71436bf4acf6162a8e04b9497ce457/aec22f8b2d7ba08f-c8/s540x810/83ac8dc1494a6f764a9b1b266fec8cb466497ccb.jpg',
          'https://i.pinimg.com/564x/4e/88/4f/4e884f2d6389775e763959e96c2196d4.jpg',
          'https://i.pinimg.com/564x/f2/bf/3d/f2bf3d8ef5351d99b8297df1cbd7a6a5.jpg',
          'https://i.pinimg.com/564x/a3/75/15/a37515eb43b8bfee620046bc25f07cd8.jpg',
          'https://i.pinimg.com/564x/97/b2/f2/97b2f20ee42c916f15a4702d188ea52d.jpg',
          'https://i.pinimg.com/564x/be/56/1d/be561d81f081b3f043aa4fbaeeab3625.jpg',
          'https://i.pinimg.com/564x/f1/80/60/f18060e072fc2cdb03373cf7d4ac9d62.jpg',
        ],
        card_colors: ['#6496b7'],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/f1/80/60/f18060e072fc2cdb03373cf7d4ac9d62.jpg',
    },
    {
      color: 'black',
      score: 4440,
      title: 'Hacker by Jay',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#000000',
          borders: '#00ff00',
          links: '#ffffff',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://i.pinimg.com/originals/d4/60/eb/d460eb4ac63b9a2fbad07a83bc3ac7f6.gif")',
          'sidebar-text': '#00ff00',
          'text-0': '#00ff00',
          'text-1': '#00ff00',
          'text-2': '#00ff00',
        },
        custom_cards: [
          'https://media2.giphy.com/media/wwg1suUiTbCY8H8vIA/200w.gif?cid=6c09b952rng2nue1dyh7f7wl2nvr3yzvsdwhc5tt05cd1zo9&ep=v1_gifs_search&rid=200w.gif&ct=g',
          'https://i.pinimg.com/originals/35/58/0d/35580d64b9b883fd0e0678595fc2aefd.gif',
          'https://media0.giphy.com/media/3oEjHWbXcpeKhTktXi/giphy.gif?cid=6c09b952xn191eix0jbyd4ee0m3tkkuaywd6z5vgahw2ia4m&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=g',
          'https://www.gifcen.com/wp-content/uploads/2023/07/hacker-gif-8.gif',
          'https://i.pinimg.com/originals/72/98/a2/7298a259e46ced8d8d636b3081a1ed57.gif',
          'https://media0.giphy.com/media/zXmbOaTpbY6mA/200.gif?cid=6c09b95254e0gb0szu8ycf0jps5869d8chn0f0etb2kw00ca&ep=v1_internal_gif_by_id&rid=200.gif&ct=g',
        ],
        card_colors: ['#000000'],
        custom_font: { link: 'Kode+Mono:wght@400;700', family: "'Kode Mono'" },
      },
      preview:
        'https://media0.giphy.com/media/3oEjHWbXcpeKhTktXi/giphy.gif?cid=6c09b952xn191eix0jbyd4ee0m3tkkuaywd6z5vgahw2ia4m&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=g',
    },
    {
      color: 'gray',
      score: 4340,
      title: 'TTPD by Rowan',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#7d7b75',
          'background-1': '#303030',
          'background-2': '#303030',
          borders: '#303030',
          links: '#363533',
          sidebar: 'linear-gradient(#828281, #000000)',
          'sidebar-text': '#e6e4e1',
          'text-0': '#00000',
          'text-1': '#00000',
          'text-2': '#363533',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/46/c9/98/46c998788df693d5a819c9f41001428b.jpg',
          'https://i.pinimg.com/564x/a6/f7/56/a6f7566a3ded805c1f343b7c936848ee.jpg',
          'https://i.pinimg.com/736x/51/69/d2/5169d2cfe2caf8f591b20f70767d6a7e.jpg',
          'https://i.pinimg.com/736x/19/06/f6/1906f6efe447906ae710230a59551f55.jpg',
          'https://i.pinimg.com/736x/3c/a8/72/3ca872a6314a94559cec753d383c19b4.jpg',
          'https://i.pinimg.com/736x/24/9a/0d/249a0d1f6b53f11ea4070a3548168463.jpg',
          'https://i.pinimg.com/736x/55/f9/86/55f986174cbe9ced832fa9fbd9060b7d.jpg',
          'https://i.pinimg.com/736x/de/2d/2e/de2d2ee2a9a57bcf98ca5490f8b6b145.jpg',
        ],
        card_colors: [
          '#ebebeb',
          '#303030',
          '#949492',
          '#000000',
          '#303030',
          '#000000',
          '#949492',
          '#ebebeb',
        ],
        custom_font: {
          family: "'Courier Prime'",
          link: 'Courier+Prime:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/a6/f7/56/a6f7566a3ded805c1f343b7c936848ee.jpg',
    },
    {
      color: 'pink',
      score: 4430,
      title: 'OrionCore by PookieBear',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fff0f0',
          'background-1': '#ffafbd',
          'background-2': '#ffafbd',
          borders: '#ffafbd',
          links: '#e56182',
          sidebar: '#ffafbd',
          'sidebar-text': '#fbeef2',
          'text-0': '#e56182',
          'text-1': '#e56183',
          'text-2': '#ffafbd',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/e6/9f/1d/e69f1dd00ade9de2ee056237b32cfd31.jpg',
          'https://i.pinimg.com/564x/b4/64/6e/b4646e96b2fad3a816bbc001e96974b1.jpg',
          'https://i.pinimg.com/564x/a3/60/36/a36036af9412b7271c371e8d5fa7b4ba.jpg',
          'https://i.pinimg.com/736x/7c/7a/c8/7c7ac8b643b750da71bb998bef593b58.jpg',
          'https://i.pinimg.com/564x/ce/c9/d1/cec9d1b3757b98894ab90182f15b7b33.jpg',
          'https://i.pinimg.com/736x/65/70/de/6570deac9ff58a9bde044cc62803a0e8.jpg',
          'https://i.pinimg.com/564x/5f/9f/9a/5f9f9aebee92c88d916137cafc717d4e.jpg',
        ],
        card_colors: ['#e56182'],
        custom_font: { family: "'Lobster'", link: 'Lobster:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/b4/64/6e/b4646e96b2fad3a816bbc001e96974b1.jpg',
    },
    {
      color: 'lightgreen',
      score: 4440,
      title: 'GreenAcademia by Rowan',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#d9ceb6',
          'background-1': '#68735b',
          'background-2': '#68735b',
          borders: '#273317',
          links: '#4f2e03',
          sidebar: 'linear-gradient(#68735b, #273317)',
          'sidebar-text': '#9ca195',
          'text-0': '#422b0c',
          'text-1': '#422b0c',
          'text-2': '#422b0c',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/0e/aa/f0/0eaaf035424a6b769bb390fcbac2e3b1.jpg',
          'https://i.pinimg.com/564x/6b/f0/36/6bf03611b705ad18e5a49cd387772410.jpg',
          'https://i.pinimg.com/564x/c7/fb/e7/c7fbe7665c22ee1f5cae94a683e7139c.jpg',
          'https://i.pinimg.com/736x/38/82/f9/3882f954661d5765f13bf1a8f23ccb18.jpg',
          'https://i.pinimg.com/564x/ef/1b/50/ef1b50e11fe3d8b3d5c7253678cc04b3.jpg',
          'https://i.pinimg.com/564x/a5/2c/f2/a52cf2eab12b7fb2aaa01eb822be8e5c.jpg',
          'https://i.pinimg.com/564x/a2/28/06/a22806458bc98c59d1ae58b4bba9d96e.jpg',
          'https://i.pinimg.com/564x/8f/a4/bd/8fa4bd7895dab40e61714a619b2465b6.jpg',
        ],
        card_colors: [
          '#49543b',
          '#49543b',
          '#526e2e',
          '#68735b',
          '#273317',
          '#49543b',
          '#49543b',
          '#666b60',
        ],
        custom_font: { family: "'Cinzel'", link: 'Cinzel:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/6b/f0/36/6bf03611b705ad18e5a49cd387772410.jpg',
    },
    {
      color: 'gray',
      score: 1440,
      title: 'JJKFAN by Xvinity3',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#2f3e46',
          'background-1': '#354f52',
          'background-2': '#52796f',
          borders: '#84a98c',
          links: '#d8f5c7',
          sidebar: '#354f52',
          'sidebar-text': '#e2e8de',
          'text-0': '#e2e8de',
          'text-1': '#cad2c5',
          'text-2': '#adb1aa',
        },
        custom_cards: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRLXgcu0Mun0s6ylzaazVyUbgtU9FN9IjcF2feNllYo0Q&s',
          'https://beebom.com/wp-content/uploads/2022/11/gojo-and-geto-friendship.jpg',
          'https://i.pinimg.com/736x/da/a1/72/daa1724c178e8dbb2ce85867f94ec1c7.jpg',
          'https://static1.cbrimages.com/wordpress/wp-content/uploads/2021/08/pjimage-53.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUfDdXoQ7oBf67jaRTLGoIh2Q-Dj1rtIEhTvy1sbNTYg&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgMhmp47-X0ZwQtKL3gg_ygDbRb8UpRbrQL_NPIGoi_Q&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtthQY1MD_mOfA5Ekp9S7EaYHSBPQi_ptrG1vV493I9Q&s',
          'https://staticg.sportskeeda.com/editor/2023/08/3ec1e-16908923074171-1920.jpg',
          'https://static0.gamerantimages.com/wordpress/wp-content/uploads/2022/12/moments-jujutsu-kaisen-s-anime-must-get-right.jpg',
          'https://pm1.aminoapps.com/7619/2d803e2099c22b73aaf6b440acb70452dcdc390er1-837-548v2_hq.jpg',
          'https://preview.redd.it/pstt2forpcz61.jpg?width=640&crop=smart&auto=webp&s=1af2ed0671205c0ebef1d74f0a336f0eccab541c',
          'https://pbs.twimg.com/media/Ep7wg1SXIAAIDhO.jpg',
          'https://pbs.twimg.com/media/DuyfVGaWsAIVn8q.jpg',
        ],
        card_colors: ['#d8f5c7'],
        custom_font: {
          family: "'Silkscreen'",
          link: 'Silkscreen:wght@400;700',
        },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUfDdXoQ7oBf67jaRTLGoIh2Q-Dj1rtIEhTvy1sbNTYg&s',
    },
    {
      color: 'white',
      score: 4441,
      title: 'Lotus by LaLa',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f5f5f5',
          'background-1': '#f5f5f5',
          'background-2': '#f5f5f5',
          borders: '#f5f5f5',
          links: '#a0a5b0',
          sidebar: '#e6e6e6',
          'sidebar-text': '#27282b',
          'text-0': '#27282b',
          'text-1': '#27282b',
          'text-2': '#27282b',
        },
        custom_cards: [
          'https://media.mutualart.com/Images/2022_08/08/19/192453931/0ad63000-36bf-487b-8dc5-c761a60d8a1d.Jpeg',
          'https://media.mutualart.com/Images/2024_05/20/18/183919978/chen-jialing-orange-lotus-3GRPV.Jpeg',
          'https://media.mutualart.com/Images/2020_11/11/20/201954059/1773df1e-2c81-4c35-a30c-12af94b39d99.Jpeg',
          'https://media.mutualart.com/Images/2017_09/08/11/110822546/f1998e68-59e3-46ae-8af9-db15a9de814c.Jpeg',
          'https://media.mutualart.com/Images/2022_07/21/13/132333422/f2931c25-906d-472c-acf7-135f5ad9e2e6.Jpeg',
          'https://media.mutualart.com/Images/2020_11/21/05/052202857/32b32f34-1d7a-46ee-a9cc-c83f5311833d.Jpeg',
          'https://media.mutualart.com/Images/2020_05/06/18/185019179/56401507-fa55-4ac7-b350-fb6d23d85995.Jpeg',
          'https://media.mutualart.com/Images/2024_05/20/18/184053665/chen-jialing-lotus-AASTC.Jpeg',
          'https://media.mutualart.com/Images/2022_08/22/11/115802234/chen-jialing-morning-lotus-Y11AS.Jpeg',
        ],
        card_colors: ['#a0a5b0'],
        custom_font: { family: "'Quicksand'", link: 'Quicksand:wght@400;700' },
      },
      preview:
        'https://media.mutualart.com/Images/2017_09/08/11/110822546/f1998e68-59e3-46ae-8af9-db15a9de814c.Jpeg',
    },
    {
      color: 'gray',
      score: 4320,
      title: 'DarkRomance by Haley',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#474343',
          'background-1': '#474343',
          'background-2': '#e9e1ba',
          borders: '#e9e1ba',
          links: '#e9e1ba',
          sidebar: 'linear-gradient(#e9e1ba, #474343)',
          'sidebar-text': '#e9e1ba',
          'text-0': '#e9e1ba',
          'text-1': '#e9e1ba',
          'text-2': '#e9e1ba',
        },
        custom_cards: [
          'https://images.squarespace-cdn.com/content/v1/5f13643bd87ba32558d653e7/e8eee7b9-1873-4add-84af-c5adaf406b26/pexels-kseniya-kopna-10305873.jpg',
          'https://p16-va.lemon8cdn.com/tos-maliva-v-ac5634-us/o43aZr9A18GiCIABZtbPA9D1iQUb12AxnuijE~tplv-tej9nj120t-origin.webp',
          'https://i.pinimg.com/736x/f6/51/fa/f651fa225054fc31c57700fffdf1c4df.jpg',
          'https://i.pinimg.com/236x/a3/0e/12/a30e12935b5273e80af31960874257f9.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmsX48Nt1WL9WnZuKQBJzhBsQmb78o9Grq5g&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd7f4KGHtSxDr43XbmDAerTGBeqIJEA1pqnP7Lcyk3FdpnxoLJAsJ9MY5xaW_nungz3iA&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREDwOwWKjPV2QxeqxXadyFYFR4b01fp6QWlA&s',
          'https://t4.ftcdn.net/jpg/06/01/03/77/360_F_601037737_PdsXsxVFexLv4MPG4sG0d85PIr4qvgmx.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2R1GVZP28tG2tRiRfDpODchs99-ArrXBZJYWpJeQc-Cq-S-v1ghwizu9s1TsN3dcSE1s&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSP-cTsdZLN9hP5HJFFJbZdpPID-iMdyptU6Q&s',
        ],
        card_colors: [
          '#975bc9',
          '#975bc9',
          '#975bc9',
          '#e9e1ba',
          '#e9e1ba',
          '#e9e1ba',
          '#e9e1ba',
          '#e9e1ba',
          '#e9e1ba',
          '#e9e1ba',
          '#e9e1ba',
          '#e9e1ba',
          '#e9e1ba',
        ],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://p16-va.lemon8cdn.com/tos-maliva-v-ac5634-us/o43aZr9A18GiCIABZtbPA9D1iQUb12AxnuijE~tplv-tej9nj120t-origin.webp',
    },
    {
      color: 'gray',
      score: 3430,
      title: 'Miffy by Ava',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#11111b',
          'background-1': '#181825',
          'background-2': '#1e1e2e',
          borders: '#4f5463',
          links: '#f5c2e7',
          sidebar: '#181825',
          'sidebar-text': '#7f849c',
          'text-0': '#cdd6f4',
          'text-1': '#7f849c',
          'text-2': '#a6e3a1',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/b6/16/4d/b6164de6ae2271eeabcee2f2c2a19882.jpg',
          'https://i.pinimg.com/564x/38/46/c7/3846c7a282bf0c8413afb20f5e420964.jpg',
          'https://i.pinimg.com/564x/11/36/14/113614d3ae8116c08b61417985d36f71.jpg',
          'https://i.pinimg.com/564x/af/cf/cb/afcfcbccb4640a5197214da7858baec7.jpg',
          'https://i.pinimg.com/564x/bd/5b/af/bd5baf54ed2350009885c4fbfbd52bc3.jpg',
          'https://i.pinimg.com/564x/15/93/86/1593869674cca905e3fddcc36d9349ea.jpg',
          'https://i.pinimg.com/564x/5e/70/8e/5e708e2fd54a831759d0102bf29c4052.jpg',
          'https://i.redd.it/finding-a-plush-v0-33hu287n3n9a1.jpg?width=750&format=pjpg&auto=webp&s=669b99bd18177067047bae9a057b47dd173b54fe',
          'https://i.pinimg.com/564x/ca/2c/93/ca2c93c80c602317606787d1224ccf57.jpg',
          'https://i.pinimg.com/564x/08/dd/9a/08dd9a86bf59df97bea418bd85099728.jpg',
          'https://preview.redd.it/glasses-miffy-v0-p4j4fzi7r6tc1.jpeg?width=640&crop=smart&auto=webp&s=9b64ca11ff7625c18fce3d494f46d346725f11a9',
        ],
        card_colors: [
          '#e7e6f7',
          '#e3d0d8',
          '#aea3b0',
          '#827081',
          '#c6d2ed',
          '#e7e6f7',
        ],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://i.pinimg.com/564x/08/dd/9a/08dd9a86bf59df97bea418bd85099728.jpg',
    },
    {
      color: 'blue',
      score: 4440,
      title: 'Watercolor by Erica',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#345265',
          'background-1': '#1e1e1e',
          'background-2': '#406272',
          borders: '#416c81',
          links: '#4dbbe0',
          sidebar: '#436270',
          'sidebar-text': '#bedff9',
          'text-0': '#92cfd3',
          'text-1': '#b9abd8',
          'text-2': '#9ac5d0',
        },
        custom_cards: [
          'https://t4.ftcdn.net/jpg/06/11/92/39/360_F_611923976_TBJ4fMbyzyp3562kyXt4K7G9NQKJi0j0.jpg',
          'https://www.rileystreet.com/cdn/shop/articles/shutterstock_410271079_1500x500_crop_center.jpg?v=1624398205',
          'https://static.vecteezy.com/system/resources/previews/024/352/546/large_2x/paint-a-watercolor-landscape-of-a-mountain-range-with-snow-capped-peaks-featuring-a-vibrant-sunset-sky-and-intricate-details-of-rocks-and-trees-generate-ai-free-photo.jpg',
          'https://images.photowall.com/products/65510/watercolor-landscape-iv-pink-and-blue.jpg?h=699&q=85',
          'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/a246d927-7c0a-4437-ac34-e2db2a290e87/dh217y8-30f5d99e-0e8b-4871-b282-059a22537cf2.jpg/v1/fill/w_900,h_507,q_75,strp/beautiful_watercolor_landscape_by_lehoangkimlong_dh217y8-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcL2EyNDZkOTI3LTdjMGEtNDQzNy1hYzM0LWUyZGIyYTI5MGU4N1wvZGgyMTd5OC0zMGY1ZDk5ZS0wZThiLTQ4NzEtYjI4Mi0wNTlhMjI1MzdjZjIuanBnIiwiaGVpZ2h0IjoiPD01MDciLCJ3aWR0aCI6Ijw9OTAwIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmltYWdlLndhdGVybWFyayJdLCJ3bWsiOnsicGF0aCI6Ilwvd21cL2EyNDZkOTI3LTdjMGEtNDQzNy1hYzM0LWUyZGIyYTI5MGU4N1wvbGVob2FuZ2tpbWxvbmctNC5wbmciLCJvcGFjaXR5Ijo5NSwicHJvcG9ydGlvbnMiOjAuNDUsImdyYXZpdHkiOiJjZW50ZXIifX0.IIZGf9nils54ErReaIMGxsD9pqusLS9WUWtfknRtXLI',
          'https://t4.ftcdn.net/jpg/02/89/35/87/360_F_289358712_zGkSt7OHJGNNyUF7RaqnPgBjsIoIpN1f.jpg',
          'https://t3.ftcdn.net/jpg/06/09/66/22/360_F_609662248_GgbZX2IAaXUcTvC5Y4bYvBvDC1FWcuou.jpg',
          'https://images.photowall.com/products/65501/watercolor-landscape-i-navy-blue.jpg?h=699&q=85',
          'https://images.fineartamerica.com/images/artworkimages/mediumlarge/3/painting-watercolor-landscape-pink-red-color-tunnel-of-wild-himalayan-cherry-roadside-in-the-morning-with-vintage-emotion-sky-background-hand-painted-beauty-nature-spring-season-landmark-in-thailand-julien.jpg',
          'https://t3.ftcdn.net/jpg/06/13/63/52/360_F_613635287_u2tYUuJOQUuO2vDLiyFoT1p9eWtWzeSH.jpg',
          'https://t4.ftcdn.net/jpg/03/48/41/61/360_F_348416135_40mjxxAvrePiLKI6himlQxOHRFycIP9C.jpg',
          'https://static.vecteezy.com/system/resources/previews/024/387/839/large_2x/paint-a-watercolor-landscape-of-a-mountain-range-with-snow-capped-peaks-featuring-a-vibrant-sunset-sky-and-intricate-details-of-rocks-and-trees-generate-ai-free-photo.jpg',
        ],
        card_colors: ['#b599d6'],
        custom_font: { family: "'Barlow'", link: 'Barlow:wght@400;700' },
      },
      preview:
        'https://images.photowall.com/products/65501/watercolor-landscape-i-navy-blue.jpg?h=699&q=85',
    },
    {
      color: 'purple',
      score: 1330,
      title: 'harrystyles by vanessa',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#2a004d',
          'background-1': '#61005e',
          'background-2': '#381849',
          borders: '#6e0c66',
          links: '#ffffff',
          sidebar: '#4c0c6e',
          'sidebar-text': '#c800d6',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://s.yimg.com/ny/api/res/1.2/RGNzx3YQNTxXD9dkyy2jyQ--/YXBwaWQ9aGlnaGxhbmRlcjt3PTY0MDtoPTg4Ng--/https://media.zenfs.com/en/glamour_497/ca8be73a003a0d1097aa0467f8934f3a',
          'https://substackcdn.com/image/fetch/w_1456,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F638cc990-dcb6-4e5e-859f-429ba882d107.heic',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTesDOC6CQYKXv934NF5AA3qOVlEtR1gzhl1S77GIwLIw&s',
          'https://pbs.twimg.com/media/Es7726qWMAAyQgV.jpg',
          'https://pbs.twimg.com/media/EY11TN1UEAAEqq0.png',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4lGBojCxRjpsPgU04nvWZBYLiExaosJQMokFsOW5BxA&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5l0MhsM3HiZpWYB7JB2R89cNUbtDrjYvQSKVAHnskYg&s',
        ],
        card_colors: [],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS5l0MhsM3HiZpWYB7JB2R89cNUbtDrjYvQSKVAHnskYg&s',
    },
    {
      color: 'black',
      score: 4330,
      title: 'Dark Green by Lake',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#040605',
          'background-1': '#161f1c',
          'background-2': '#5b5f5c',
          borders: '#161f1c',
          links: '#a4a48c',
          sidebar: 'linear-gradient(#161f1cc7, #040605c7), center url("")',
          'sidebar-text': '#5b5f50',
          'text-0': '#5b5f5c',
          'text-1': '#5b5f5c',
          'text-2': '#5b5f5c',
        },
        custom_cards: [
          'https://png.pngtree.com/thumb_back/fh260/background/20231225/pngtree-aesthetic-watercolor-dark-green-background-abstract-spruce-stains-on-paper-image_13866525.png',
          'https://png.pngtree.com/thumb_back/fh260/background/20231227/pngtree-aesthetic-watercolor-texture-abstract-dark-green-backdrop-with-old-deep-hues-image_13866857.png',
        ],
        card_colors: ['#979781', '#8a8b77'],
        custom_font: { link: '', family: '' },
      },
      preview:
        'https://png.pngtree.com/thumb_back/fh260/background/20231227/pngtree-aesthetic-watercolor-texture-abstract-dark-green-backdrop-with-old-deep-hues-image_13866857.png',
    },
    {
      color: 'lightgreen',
      score: 4440,
      title: 'Spirited Away by Kayzel',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e3e5d7',
          'background-1': '#9fb98d',
          'background-2': '#6f8060',
          borders: '#6f8060',
          links: '#6f8060',
          sidebar: '#9fb98d',
          'sidebar-text': '#f5f5f5',
          'text-0': '#4e5a44',
          'text-1': '#4e5a44',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://media.giphy.com/media/K0yXL4cDnFrq0/giphy.gif?cid=ecf05e476lr6ojnw8bie24i0n3izpf12ya0b1lwpnvb4r9zw&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExa2V0dWRubmY3ejM2NXMydmhrNGFjNTVxMWxvYXF1amxxdjIyd3puZiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/fpTwAdKL3ZCBa/giphy.gif',
          'https://media.giphy.com/media/dEdgB3euossMg/giphy.gif?cid=ecf05e47z0hhwddinomsrxe0xl8xa0cuxc3ichijxa54ejto&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/CRWdhM1XgJ7Pi/giphy.gif?cid=ecf05e47z0hhwddinomsrxe0xl8xa0cuxc3ichijxa54ejto&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/oje6kPRIef6Gk/giphy.gif?cid=790b7611ketudnnf7z365s2vhk4ac55q1loaqujlqv22wznf&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/hXYlYBixtHEFq/giphy.gif?cid=ecf05e478h1vpiy0wsq50blpozx1a7oummmceuenmk0609r5&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/7uL3gPwnUBrvq/giphy.gif?cid=ecf05e478h1vpiy0wsq50blpozx1a7oummmceuenmk0609r5&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/yrBwdH8CD7K5q/giphy.gif?cid=ecf05e475bai9wj859bqqexdgv8e4tyra752f61tdbxde1mh&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/YY9MdZisfM3x6/giphy.gif?cid=ecf05e47oopmp0u9585im1nivv8zxh60n4a5aln3wpwu2xhx&ep=v1_gifs_search&rid=giphy.gif&ct=g',
        ],
        card_colors: [
          '#6b705c',
          '#a5a58d',
          '#b7b7a4',
          '#ffe8d6',
          '#ddbea9',
          '#cb997e',
          '#797f68',
          '#a5a58d',
          '#b7b7a4',
        ],
        custom_font: {
          family: "'Inria Sans'",
          link: 'Inria+Sans:wght@400;700',
        },
      },
      preview:
        'https://media.giphy.com/media/YY9MdZisfM3x6/giphy.gif?cid=ecf05e47oopmp0u9585im1nivv8zxh60n4a5aln3wpwu2xhx&ep=v1_gifs_search&rid=giphy.gif&ct=g',
    },
    {
      color: 'lightblue',
      score: 4440,
      title: 'Soft Blues by Lily',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#7ba1db',
          'background-2': '#3b659b',
          borders: '#2e93ff',
          links: '#4dacff',
          sidebar: '#9bcffd',
          'sidebar-text': '#ffffff',
          'text-0': '#006cfa',
          'text-1': '#1486ff',
          'text-2': '#3d84f0',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/c8/32/18/c832189161cc3f33c10243d185b81c66.jpg',
          'https://i.pinimg.com/564x/ad/be/b3/adbeb308cce9bd80bd124e987f0b7eea.jpg',
          'https://i.pinimg.com/736x/7a/73/79/7a7379bf7379caa9adc09ce0a233f3b4.jpg',
          'https://i.pinimg.com/736x/17/51/c7/1751c73a3a5f03563a5ace28ad0294bd.jpg',
          'https://i.pinimg.com/736x/a6/0a/e0/a60ae09497914689a5bae7278d446941.jpg',
          'https://i.pinimg.com/736x/8e/77/2b/8e772b1e9f2dc8fc11fd808570897e0b.jpg',
        ],
        card_colors: ['#d6eaff'],
        custom_font: { family: "'Lora'", link: 'Lora:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/ad/be/b3/adbeb308cce9bd80bd124e987f0b7eea.jpg',
    },
    {
      color: 'green',
      score: 4340,
      title: 'GhibliSpring by Mel',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#a6ddcd',
          'background-1': '#cbfcb6',
          'background-2': '#52796f',
          borders: '#61b3b1',
          links: '#d8f5c7',
          sidebar: 'linear-gradient(#a78bda, #a2fba3)',
          'sidebar-text': '#89f5c3',
          'text-0': '#c07cf8',
          'text-1': '#920c8e',
          'text-2': '#7e599b',
        },
        custom_cards: [
          'https://64.media.tumblr.com/3ea30da4f56c34ccb1141d9691390423/tumblr_p9t2ksYv8r1qa9gmgo10_r2_1280.jpg',
          'https://i.pinimg.com/originals/f8/e3/9d/f8e39dcb2fce2ba26b1b19e2a67ca74e.gif',
          'https://64.media.tumblr.com/273783fd75b836f7aa73d7ac55e39e5e/tumblr_p9t2ksYv8r1qa9gmgo4_r1_1280.jpg',
          'https://i.pinimg.com/736x/e4/ec/ae/e4ecae599a35af716ff4e31fd12952f1.jpg',
          'https://i.redd.it/wbfuh9xeimpb1.jpg',
          'https://i.pinimg.com/originals/9a/14/03/9a1403e7ad4a6222c18232fb1537c1ed.gif',
          'https://i.pinimg.com/originals/c7/02/18/c702187178b30041001f406abb8ec9fa.gif',
          'https://i.pinimg.com/564x/92/ae/5a/92ae5ad0b4fb601d14de5c1805324a2c.jpg',
          'https://imagedelivery.net/9sCnq8t6WEGNay0RAQNdvQ/UUID-cl90fjfhv184494vmqyclfo49yv/public',
          'https://64.media.tumblr.com/9472e453a095f8e49d2d06f5a9459fa9/e6d01b1b3993cc78-22/s540x810/d949128a5230d3d3fa8218490dd8331489b531fd.gif',
          'https://i.pinimg.com/originals/2e/44/b3/2e44b35688301004752a93a6b9ed42fb.gif',
          'https://i.pinimg.com/originals/03/9a/0f/039a0fd1752469f24a98c67f5fbf3da3.gif',
          'https://i.pinimg.com/originals/34/f8/f3/34f8f3372b21c396cc2a3efd9627924c.gif',
        ],
        card_colors: [
          '#f06291',
          '#0b9be3',
          '#ffa3a5',
          '#65499d',
          '#ffdc5e',
          '#009606',
        ],
        custom_font: { family: "'Poppins'", link: 'Poppins:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/736x/e4/ec/ae/e4ecae599a35af716ff4e31fd12952f1.jpg',
    },
    {
      color: 'green',
      score: 4340,
      title: 'Kermit by Nethra',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#3a6445',
          'background-1': '#304a32',
          'background-2': '#518163',
          borders: '#7fc391',
          links: '#59c2c9',
          sidebar: 'linear-gradient(#214418, #000000)',
          'sidebar-text': '#7de898',
          'text-0': '#f7f8f7',
          'text-1': '#a8d789',
          'text-2': '#4dac60',
        },
        custom_cards: [
          'https://media1.giphy.com/media/VeT5jhseHD0W3dI7de/200w.gif?cid=6c09b952lss5cwr5995zwl3phzmvc6ob80s99mx29ftej3aj&ep=v1_gifs_search&rid=200w.gif&ct=g',
          'https://media1.giphy.com/media/xdLH51eNWZAHrwy5mf/200w.gif?cid=6c09b95277ojbddg52ujarcjlhnp2viua1v7cves9zk1tuqz&ep=v1_gifs_search&rid=200w.gif&ct=g',
          'https://media0.giphy.com/media/bEVKYB487Lqxy/giphy.gif?cid=6c09b952lanhum07dp27gpkbsv39bhsz0t04e1w3glq7g7yf&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://i.pinimg.com/originals/61/ed/fb/61edfbac27df12dbf850f14b5c0f5858.gif',
          'https://media2.giphy.com/media/NaNyhn6HfdTRqJ4U5F/200w.gif?cid=6c09b952n4r7t614bic1hbe3gu05im7eykanqcvlt6dvq57v&ep=v1_videos_search&rid=200w.gif&ct=v',
          'https://media2.giphy.com/media/o6HZwLCYWKXvQ47Zrb/giphy.gif?cid=6c09b952qsigmt8m1pra1oqhzvs2454ypb4dvcjdsz3lntm0&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=g',
          'https://media4.giphy.com/media/mMctlNZo7Kmoo/giphy.gif?cid=6c09b9526jfb9duxvw0e3gm5ejpzcdiah48vp4xrfr68o8oa&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media3.giphy.com/media/LmBsnpDCuturMhtLfw/giphy.gif?cid=6c09b952bnlf8nkf11tg74ah1vedk88ro3rx9414zkd7gfd6&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=g',
          'https://media2.giphy.com/media/2zelCiUo5KJyN8MgMr/giphy.gif?cid=6c09b952xjukhcwh9j8qv60zdyndq4efpn0z0zq760nrojcy&ep=v1_gifs_search&rid=giphy.gif&ct=g',
        ],
        card_colors: [],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://media1.giphy.com/media/xdLH51eNWZAHrwy5mf/200w.gif?cid=6c09b95277ojbddg52ujarcjlhnp2viua1v7cves9zk1tuqz&ep=v1_gifs_search&rid=200w.gif&ct=g',
    },
    {
      color: 'green',
      score: 4440,
      title: 'WaraWara by صحارا',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#102623',
          'background-1': '#204744',
          'background-2': '#446f4c',
          borders: '#446f4c',
          links: '#6cc0c6',
          sidebar:
            'linear-gradient(#102623c7, #000000c7), center url("https://64.media.tumblr.com/90eb3bf0f472dd35601bbd491a74e912/f496c99cb6dbf90a-7f/s540x810/f8a87714613ab6413a91b04a8212306090d0f671.gif")',
          'sidebar-text': '#e1f9ed',
          'text-0': '#6cc0c6',
          'text-1': '#e1f9ed',
          'text-2': '#e1f9ed',
        },
        custom_cards: [
          'https://media1.tenor.com/m/QeNq3_I5-owAAAAC/green-studio-ghibli.gif',
          'https://media1.tenor.com/m/d_Yb1KEUhgEAAAAC/lvrnjm-warawara.gif',
          'https://64.media.tumblr.com/90eb3bf0f472dd35601bbd491a74e912/f496c99cb6dbf90a-7f/s540x810/f8a87714613ab6413a91b04a8212306090d0f671.gif',
        ],
        card_colors: ['#2e5d4c', '#65f7d7', '#2e5d4c'],
        custom_font: {
          family: "'Expletus Sans'",
          link: 'Expletus+Sans:wght@400;700',
        },
      },
      preview:
        'https://media1.tenor.com/m/d_Yb1KEUhgEAAAAC/lvrnjm-warawara.gif',
    },
    {
      color: 'lightgreen',
      score: 4440,
      title: 'NatureGreen by Sas',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#c2c5aa',
          'background-1': '#a4ac86',
          'background-2': '#a4ac86',
          borders: '#a4ac86',
          links: '#656d4a',
          sidebar: 'linear-gradient(#333d29, #a4ac86)',
          'sidebar-text': '#c2c5aa',
          'text-0': '#333d29',
          'text-1': '#333d29',
          'text-2': '#333d29',
        },
        custom_cards: [
          'https://d2uqfpnktc64mn.cloudfront.net/uploads/post/image/000/002/042/tumblr_mt9yl2pgLh1qa4szeo1_500.gif',
          'https://i.makeagif.com/media/12-02-2016/0kYDOl.gif',
          'https://i.pinimg.com/474x/fa/62/1c/fa621c222352df35e79641ac909bfecb.jpg',
          'https://gifdb.com/images/high/spirea-flowers-blossom-qilalpqudypaf9vk.gif',
          'https://i.pinimg.com/originals/78/57/4d/78574d6f894832507f71f598b6d35a38.gif',
          'https://giffiles.alphacoders.com/370/3700.gif',
          'https://64.media.tumblr.com/9e0731c5fd8e97d29a6f1f6928355572/tumblr_p2zkqfzA4B1wxub9uo1_1280.gif',
        ],
        card_colors: ['#333d29'],
        custom_font: { family: "'Oswald'", link: 'Oswald:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/474x/fa/62/1c/fa621c222352df35e79641ac909bfecb.jpg',
    },
    {
      color: 'blue',
      score: 4340,
      title: 'Dragonball by Anthony',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0055ff',
          'background-1': '#efff14',
          'background-2': '#0c0c0c',
          borders: '#000000',
          links: '#000000',
          sidebar: 'linear-gradient(#0055ff, #efff14)',
          'sidebar-text': '#000000',
          'text-0': '#ffffff',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/3e/cf/1a/3ecf1aca6aeabb57e06958d39fbb3d72.gif',
          'https://i.pinimg.com/originals/50/24/80/50248028c166c1be1a8457f151ea91f5.gif',
          'https://i.pinimg.com/originals/12/04/ff/1204ff170d1ef81f6f539ecde3f3dd14.gif',
          'https://i.pinimg.com/originals/ac/fd/1d/acfd1dde5f10cd4953b6145fd44a2f60.gif',
          'https://i.pinimg.com/originals/54/93/84/549384459a8ac16a1c4eb0a450d92e1a.gif',
          'https://i.pinimg.com/originals/09/03/90/090390912178a701853c3a5e162e5e7a.gif',
          'https://i.pinimg.com/originals/57/6d/bc/576dbcead8ce27dc72658a3320b56d35.gif',
        ],
        card_colors: ['#272626'],
        custom_font: {
          family: "'Silkscreen'",
          link: 'Silkscreen:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/originals/50/24/80/50248028c166c1be1a8457f151ea91f5.gif',
    },
    {
      color: 'white',
      score: 4340,
      title: 'Miku by Kirat',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#eef4f6',
          'background-1': '#c3d2da',
          'background-2': '#a3b6c8',
          borders: '#caf1f2',
          links: '#c1cacd',
          sidebar:
            'linear-gradient(#f0e5e5c7, #d0f8fbc7), center url("https://i.pinimg.com/736x/9f/52/4b/9f524b2ae26694cf389363528c9d53db.jpg")',
          'sidebar-text': '#9396ec',
          'text-0': '#92a8d9',
          'text-1': '#92a8d9',
          'text-2': '#92a8d9',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/4f/67/eb/4f67eb36e32736b9adaffe127a592e42.jpg',
          'https://i.pinimg.com/474x/8c/67/0e/8c670e09ad1a7c4c4b58e6ced8022258.jpg',
          'https://i.pinimg.com/736x/48/65/e4/4865e4ef738f5e324495952aa6f039f6.jpg',
          'https://i.pinimg.com/474x/f0/77/e5/f077e56a0f0d7b32e227977ba41bdc4e.jpg',
          'https://i.pinimg.com/474x/3e/f2/ea/3ef2ea05c42119839b8c36022288c579.jpg',
          'https://i.pinimg.com/474x/e3/66/ab/e366abf3205cda427696097759f48822.jpg',
          'https://i.pinimg.com/474x/11/3d/57/113d5729c03b937cc0db6c11644d529f.jpg',
          'https://i.pinimg.com/474x/87/c9/6d/87c96d2728d75870af706b53e6090391.jpg',
          'https://i.pinimg.com/474x/1e/60/3d/1e603dc9a94f3493acd1844f2ad2b5fa.jpg',
          'https://i.pinimg.com/474x/15/c6/ad/15c6ada8feaef0152a936b42140d84e2.jpg',
        ],
        card_colors: [
          '#ade8f4',
          '#90e0ef',
          '#48cae4',
          '#00b4d8',
          '#0096c7',
          '#ade8f4',
          '#90e0ef',
          '#48cae4',
          '#00b4d8',
          '#0096c7',
        ],
        custom_font: { family: "'Caveat'", link: 'Caveat:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/474x/8c/67/0e/8c670e09ad1a7c4c4b58e6ced8022258.jpg',
    },
    {
      color: 'white',
      score: 4440,
      title: 'atamonica by nghia',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#ffffff',
          'background-2': '#179b9b',
          borders: '#000000',
          links: '#000000',
          sidebar: '#9bcaca',
          'sidebar-text': '#dedede',
          'text-0': '#000000',
          'text-1': '#000000',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://pbs.twimg.com/media/GKzpc5Va0AAgAQz?format=jpg&name=4096x4096',
          'https://pbs.twimg.com/media/GJDA0zza4AAzMPH?format=jpg&name=large',
          'https://pbs.twimg.com/media/GH_F8NvboAA67e_?format=jpg&name=large',
          'https://pbs.twimg.com/media/GIlalg3bgAMsvld?format=jpg&name=medium',
          'https://pbs.twimg.com/media/GFKSUEIaQAER0iK?format=jpg&name=medium',
          'https://pbs.twimg.com/media/GFKSVpQbYAAFEAG?format=jpg&name=medium',
          'https://pbs.twimg.com/media/GLn7HmIaQAActjQ?format=jpg&name=large',
          'https://pbs.twimg.com/media/GCsR53basAAeqkJ?format=jpg&name=large',
          'https://pbs.twimg.com/media/F5A3KVgaUAAep0X?format=jpg&name=medium',
          'https://pbs.twimg.com/media/F8aM9eAbUAAX-gj?format=jpg&name=medium',
          'https://pbs.twimg.com/media/F9msLw5acAAU590?format=jpg&name=medium',
          'https://pbs.twimg.com/media/F9msLlRaIAAIuw1?format=jpg&name=medium',
          'https://pbs.twimg.com/media/GL3EUuMaUAAyz7_?format=jpg&name=large',
          'https://pbs.twimg.com/media/GLXS4j9agAAjJAw?format=jpg&name=medium',
        ],
        card_colors: [
          '#284057',
          '#3e589b',
          '#3f626f',
          '#2c4c58',
          '#2d3e3f',
          '#535c73',
          '#284057',
          '#3e589b',
          '#3f626f',
          '#2c4c58',
          '#2d3e3f',
          '#535c73',
          '#284057',
          '#3e589b',
        ],
        custom_font: {
          family: "'Roboto Mono'",
          link: 'Roboto+Mono:wght@400;700',
        },
      },
      preview:
        'https://pbs.twimg.com/media/GFKSUEIaQAER0iK?format=jpg&name=medium',
    },
    {
      color: 'gray',
      score: 3340,
      title: 'yoshitomonara by dace',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#7d8e97',
          'background-1': '#354f52',
          'background-2': '#586c6f',
          borders: '#84a98c',
          links: '#d8f5c7',
          sidebar: '#75a36c',
          'sidebar-text': '#e2e8de',
          'text-0': '#e2e8de',
          'text-1': '#cad2c5',
          'text-2': '#adb1aa',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/78/01/54/780154c3e8d7de50a1f0b0b65cc92a3a.jpg',
          'https://i.pinimg.com/236x/20/1e/d9/201ed9a20e46e42e116c52408c7a151d.jpg',
          'https://i.pinimg.com/236x/fa/cb/d4/facbd4d7b1346a723db825185d7ce992.jpg',
          'https://i.pinimg.com/236x/e1/50/ad/e150adfa0be37bd7fb34668045a29c54.jpg',
          'https://i.pinimg.com/236x/03/c1/fa/03c1fa300cd2d252ff194a16042b251d.jpg',
          'https://i.pinimg.com/236x/f4/01/f2/f401f2de5c05a8c670de6ccc4fbc1c09.jpg',
          'https://i.pinimg.com/236x/65/5a/9e/655a9ed63c2d3af4365e489faf89f233.jpg',
          'https://i.pinimg.com/236x/90/44/6c/90446c83508a08cbc0d33835dd81cc49.jpg',
          'https://i.pinimg.com/236x/e2/f2/78/e2f27815ece43fa645c1b6f78050bee7.jpg',
        ],
        card_colors: [
          '#6b705c',
          '#a5a58d',
          '#b7b7a4',
          '#ffe8d6',
          '#ddbea9',
          '#cb997e',
          '#6b705c',
          '#a5a58d',
          '#b7b7a4',
        ],
        custom_font: {
          family: "'Nanum Myeongjo'",
          link: 'Nanum+Myeongjo:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/236x/e2/f2/78/e2f27815ece43fa645c1b6f78050bee7.jpg',
    },
    {
      color: 'black',
      score: 4320,
      title: 'Tvgirl by urmom',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#1f4bff',
          'background-2': '#fb2dc4',
          borders: '#1f4bff',
          links: '#fb2dc4',
          sidebar: '#fb2dc4',
          'sidebar-text': '#1f4bff',
          'text-0': '#1f4bff',
          'text-1': '#fb2dc4',
          'text-2': '#1f4bff',
        },
        custom_cards: [
          'https://i.scdn.co/image/ab67616d00001e0232f5fec7a879ed6ef28f0dfd',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSQaqJGcUAFIUQ2oyhsh9vyOB_PdPiJtLV_t5cvjlHDyR4wGaGmfUkE5G44C6MrEtzKVcU&usqp=CAU',
        ],
        card_colors: [
          '#ade8f4',
          '#90e0ef',
          '#48cae4',
          '#00b4d8',
          '#0096c7',
          '#ade8f4',
          '#90e0ef',
          '#48cae4',
          '#00b4d8',
          '#0096c7',
        ],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://i.scdn.co/image/ab67616d00001e0232f5fec7a879ed6ef28f0dfd',
    },
    {
      color: 'gray',
      score: 1230,
      title: 'Mclarenf1 by Jordan',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#212838',
          'background-1': '#1f3b56',
          'background-2': '#212930',
          borders: '#2e3943',
          links: '#04b2ec',
          sidebar: '#1a2026',
          'sidebar-text': '#e31616',
          'text-0': '#f5f5f5',
          'text-1': '#c6c3c3',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://hips.hearstapps.com/hmg-prod/images/mcl36-launch-2-front-dr-velo-1644607596.jpg?crop=1.00xw:0.502xh;0,0.223xh&resize=640:*',
          'https://cdn.dribbble.com/users/2638942/screenshots/6406751/james_hunt_canvas.jpg',
          'https://d2n9h2wits23hf.cloudfront.net/image/v1/static/6057949432001/8789cc52-6619-4d3a-a6da-2a122cf0f579/ce168ddb-8792-4e89-aedc-31422197753c/640x360/match/image.jpg',
          'https://www.si.com/.image/ar_4:3%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:good%2Cw_1200/MjAzNjcyOTczNDM2MDA0Mjgz/gd-lf-kxcaa7pn6.jpg',
          'https://mir-s3-cdn-cf.behance.net/projects/404/3ceff0183233523.Y3JvcCwxMDYwLDgyOSwxNjIsMTg4.jpg',
          'https://images.ps-aws.com/c?url=https%3A%2F%2Fd3cm515ijfiu6w.cloudfront.net%2Fwp-content%2Fuploads%2F2023%2F03%2F03213429%2F2P12F85-1.jpg',
          'https://cdn.dribbble.com/users/2638942/screenshots/6406739/senna_helmet_illustration_canvas.jpg',
          'https://di-uploads-pod31.dealerinspire.com/mclarenpalmbeach/uploads/2022/09/Orange-McLaren-MCL36.jpg',
          'https://www.carscoops.com/wp-content/uploads/2021/05/McLaren-F1-Car-1a.jpg',
        ],
        card_colors: [
          '#4554a4',
          '#8f3e97',
          '#d97900',
          '#e1185c',
          '#ad4769',
          '#e1185c',
          '#d41e00',
          '#fd5d10',
          '#06a3b7',
          '#0870a4',
          '#626e7b',
          '#177b63',
        ],
        custom_font: {
          family: "'Happy Monkey'",
          link: 'Happy+Monkey:wght@400;700',
        },
      },
      preview:
        'https://mir-s3-cdn-cf.behance.net/projects/404/3ceff0183233523.Y3JvcCwxMDYwLDgyOSwxNjIsMTg4.jpg',
    },
    {
      color: 'blue',
      score: 4430,
      title: 'WanoBlues by Neptoon',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0a272e',
          'background-1': '#103842',
          'background-2': '#103842',
          borders: '#1a5766',
          links: '#3bb9d8',
          sidebar: '#103842',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/ae/9d/f3/ae9df33f2b71c55b7659fe8d6b47c269.jpg',
          'https://i.pinimg.com/564x/e0/fe/37/e0fe37fabfd1725774f8fb965207b119.jpg',
          'https://i.pinimg.com/564x/5e/9f/ff/5e9fff351454c0814996405f47be052a.jpg',
        ],
        card_colors: ['#1770ab', '#74c69d', '#74c69d'],
        custom_font: {
          family: "'Silkscreen'",
          link: 'Silkscreen:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/5e/9f/ff/5e9fff351454c0814996405f47be052a.jpg',
    },
    {
      color: 'black',
      score: 4430,
      title: 'Matrix by Michael',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000',
          'background-1': '#00ff00',
          'background-2': '#00ff00',
          borders: '#00ff00',
          links: '#00ff00',
          sidebar:
            'linear-gradient(#001100c7, #00a800c7), center url("https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXb6q8CFRj51EDS00niBfCvRNwdIm1cFNahw&s")',
          'sidebar-text': '#000000',
          'text-0': '#00a800',
          'text-1': '#dcffdb',
          'text-2': '#dcffdb',
        },
        custom_cards: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXb6q8CFRj51EDS00niBfCvRNwdIm1cFNahw&s',
        ],
        card_colors: ['#003c00'],
        custom_font: {
          family: "'Expletus Sans'",
          link: 'Expletus+Sans:wght@400;700',
        },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXb6q8CFRj51EDS00niBfCvRNwdIm1cFNahw&s',
    },
    {
      color: 'gray',
      score: 3440,
      title: 'Genshin by Robyn',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#444141',
          'background-1': '#9eba87',
          'background-2': '#9eba87',
          borders: '#573838',
          links: '#8aa984',
          sidebar: '#9eba87',
          'sidebar-text': '#ffffff',
          'text-0': '#9eba87',
          'text-1': '#ffffff',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://64.media.tumblr.com/cfc7361791ec2f0f811bf4ae71fb82a8/0ff48502918df4c5-f3/s540x810/02aa8a58cc185e97543c5229c6493149a9a9e8b4.gif',
          'https://64.media.tumblr.com/e51ae9c744446dfe119e103040872312/746becfdec04cdaa-f1/s540x810/53cef06df82aa4bd3affbc0fd9462394a224f976.gif',
          'https://64.media.tumblr.com/e156a0416aa6085c1738c7e0a7ad33e8/568d6ed15a7c5585-f4/s540x810/f15c994585e69c0d166101e2a3c52b275c587a62.gif',
          'https://giffiles.alphacoders.com/215/215954.gif',
          'https://64.media.tumblr.com/332bd0efe79cfa9ed3432b820de2a1db/2975f4d5e1d8b0c2-ed/s540x810/6133cf56b4592ce87fa747b13c2268d1c6264dd2.gifv',
          'https://64.media.tumblr.com/3669f5d028ee4e77137b4ee6fdc59c76/9c49bb5d36f57638-1f/s540x810/37f7e143b2b4a0f54bf5f3267f88bb2266d92be0.gif',
          'https://64.media.tumblr.com/2105a6c1e290017dcca11c374ef80d8e/bea86a57493284f7-e3/s540x810/7b4e24206ba0d292c3a0f596fafd2ca32e4da29b.gif',
          'https://64.media.tumblr.com/7ae9452f4c0ce575332203d27aa9c7ff/eb43e426ff9db5fc-2a/s540x810/3d1b1f3d7e75aa5fcbb3119c4f47495d82984cf3.gifv',
        ],
        card_colors: [
          '#d8f3dc',
          '#b7e4c7',
          '#95d5b2',
          '#74c69d',
          '#52b788',
          '#d8f3dc',
          '#b7e4c7',
          '#95d5b2',
        ],
        custom_font: { family: "'Lora'", link: 'Lora:wght@400;700' },
      },
      preview:
        'https://64.media.tumblr.com/2105a6c1e290017dcca11c374ef80d8e/bea86a57493284f7-e3/s540x810/7b4e24206ba0d292c3a0f596fafd2ca32e4da29b.gif',
    },
    {
      color: 'gray',
      score: 4430,
      title: 'Red by Lekonic',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#14181d',
          'background-1': '#1a2026',
          'background-2': '#212930',
          borders: '#ff0000',
          links: '#ff0000',
          sidebar: '#1a2026',
          'sidebar-text': '#ff0000',
          'text-0': '#ff0000',
          'text-1': '#ff0000',
          'text-2': '',
        },
        custom_cards: [
          'https://img.freepik.com/premium-photo/geometric-shapes-wallpaper_941097-14905.jpg?size=626&ext=jpg&ga=GA1.1.1369675164.1715644800&semt=ais_user',
        ],
        card_colors: [
          '#ff0000',
          '#d90000',
          '#d90000',
          '#d90000',
          '#d90000',
          '#d90000',
          '#d90000',
          '#d90000',
          '#d90000',
        ],
        custom_font: { family: "'Kanit'", link: 'Kanit:wght@400;700' },
      },
      preview:
        'https://img.freepik.com/premium-photo/geometric-shapes-wallpaper_941097-14905.jpg?size=626&ext=jpg&ga=GA1.1.1369675164.1715644800&semt=ais_user',
    },
    {
      color: 'gray',
      score: 4430,
      title: 'Orange by Lekonic',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#14181d',
          'background-1': '#1a2026',
          'background-2': '#212930',
          borders: '#ff9500',
          links: '#ff9500',
          sidebar: '#1a2026',
          'sidebar-text': '#ff9500',
          'text-0': '#ff9500',
          'text-1': '#ff9500',
          'text-2': '#ff9500',
        },
        custom_cards: [
          'https://st2.depositphotos.com/4112313/7857/v/450/depositphotos_78577444-stock-illustration-shades-of-orange-abstract-polygonal.jpg',
        ],
        card_colors: [
          '#ff9500',
          '#9c5c00',
          '#9c5c00',
          '#9c5c00',
          '#9c5c00',
          '#9c5c00',
          '#ff9500',
          '#9c5c00',
          '#9c5c00',
        ],
        custom_font: { family: "'Kanit'", link: 'Kanit:wght@400;700' },
      },
      preview:
        'https://st2.depositphotos.com/4112313/7857/v/450/depositphotos_78577444-stock-illustration-shades-of-orange-abstract-polygonal.jpg',
    },
    {
      color: 'gray',
      score: 4430,
      title: 'Yellow by Lekonic',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#14181d',
          'background-1': '#1a2026',
          'background-2': '#212930',
          borders: '#ffc800',
          links: '#ffc800',
          sidebar: '#1a2026',
          'sidebar-text': '#ffc800',
          'text-0': '#ffc800',
          'text-1': '#ffc800',
          'text-2': '#ffc800',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/c2/41/3b/c2413b33840fb46ca118fe3bb8c32cbf.jpg',
        ],
        card_colors: ['#ffc800'],
        custom_font: { family: "'Kanit'", link: 'Kanit:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/736x/c2/41/3b/c2413b33840fb46ca118fe3bb8c32cbf.jpg',
    },
    {
      color: 'gray',
      score: 4430,
      title: 'Green by Lekonic',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#14181d',
          'background-1': '#1a2026',
          'background-2': '#212930',
          borders: '#c8ff00',
          links: '#c8ff00',
          sidebar: '#1a2026',
          'sidebar-text': '#c8ff00',
          'text-0': '#c8ff00',
          'text-1': '#c8ff00',
          'text-2': '',
        },
        custom_cards: [
          'https://t3.ftcdn.net/jpg/00/88/04/36/360_F_88043670_o8wrOR3dQtktffvrfG2k0V6hTAjWsnsW.jpg',
        ],
        card_colors: ['#c8ff00'],
        custom_font: { family: "'Kanit'", link: 'Kanit:wght@400;700' },
      },
      preview:
        'https://t3.ftcdn.net/jpg/00/88/04/36/360_F_88043670_o8wrOR3dQtktffvrfG2k0V6hTAjWsnsW.jpg',
    },
    {
      color: 'gray',
      score: 4430,
      title: 'Blue by Lekonic',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#14181d',
          'background-1': '#1a2026',
          'background-2': '#212930',
          borders: '#00b3ff',
          links: '#00b3ff',
          sidebar: '#1a2026',
          'sidebar-text': '#00b3ff',
          'text-0': '#00b3ff',
          'text-1': '#00b3ff',
          'text-2': '#00b3ff',
        },
        custom_cards: [
          'https://t4.ftcdn.net/jpg/01/61/54/59/360_F_161545979_7caaJyf9POUETr4kEVABCQHxst2S4og1.jpg',
        ],
        card_colors: ['#00b3ff'],
        custom_font: { family: "'Kanit'", link: 'Kanit:wght@400;700' },
      },
      preview:
        'https://t4.ftcdn.net/jpg/01/61/54/59/360_F_161545979_7caaJyf9POUETr4kEVABCQHxst2S4og1.jpg',
    },
    {
      color: 'gray',
      score: 4430,
      title: 'Purple by Lekonic',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#14181d',
          'background-1': '#1a2026',
          'background-2': '#212930',
          borders: '#ba1bda',
          links: '#ba1bda',
          sidebar: '#1a2026',
          'sidebar-text': '#ba1bda',
          'text-0': '#ba1bda',
          'text-1': '#ba1bda',
          'text-2': '#ba1bda',
        },
        custom_cards: [
          'https://images.freeimages.com/clg/istock/previews/1008/100811629-shades-of-purple-abstract-polygonal-geometric-background-low-poly.jpg',
        ],
        card_colors: ['#ba1bda'],
        custom_font: { family: "'Kanit'", link: 'Kanit:wght@400;700' },
      },
      preview:
        'https://images.freeimages.com/clg/istock/previews/1008/100811629-shades-of-purple-abstract-polygonal-geometric-background-low-poly.jpg',
    },
    {
      color: 'gray',
      score: 4430,
      title: 'Pink by Lekonic',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#14181d',
          'background-1': '#1a2026',
          'background-2': '#212930',
          borders: '#ff94f6',
          links: '#ff00ea',
          sidebar: '#1a2026',
          'sidebar-text': '#ff00ea',
          'text-0': '#ff94f6',
          'text-1': '#ff00ea',
          'text-2': '',
        },
        custom_cards: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBsOp_S7HgZ3NvQkXjaHiWmKGnPj_4oo_XUsFq-UGxvQ&s',
        ],
        card_colors: [
          '#ff94f6',
          '#ff00ea',
          '#ff94f6',
          '#ff94f6',
          '#ff00ea',
          '#ff94f6',
          '#ff00ea',
          '#ff94f6',
          '#ff00ea',
        ],
        custom_font: { family: "'Kanit'", link: 'Kanit:wght@400;700' },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBsOp_S7HgZ3NvQkXjaHiWmKGnPj_4oo_XUsFq-UGxvQ&s',
    },
    {
      color: 'gray',
      score: 4430,
      title: 'Grayscale by Lekonic',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#14181d',
          'background-1': '#1a2026',
          'background-2': '#212930',
          borders: '#ffffff',
          links: '#ffffff',
          sidebar: '#1a2026',
          'sidebar-text': '#ffffff',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#ffffff',
        },
        custom_cards: ['https://wallpapercave.com/wp/wp6446359.png'],
        card_colors: [
          '#fffffa',
          '#71716f',
          '#fffffa',
          '#71716f',
          '#fffffa',
          '#71716f',
          '#fffffa',
          '#fffffa',
          '#fffffa',
        ],
        custom_font: { family: "'Kanit'", link: 'Kanit:wght@400;700' },
      },
      preview: 'https://wallpapercave.com/wp/wp6446359.png',
    },
    {
      color: 'blue',
      score: 4440,
      title: 'MDZS by Tofu',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#11111b',
          'background-1': '#181825',
          'background-2': '#1e1e2e',
          borders: '#2c303a',
          links: '#b3cfea',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://pbs.twimg.com/media/ET9zuyNWkAA3AGz?format=jpg&name=large")',
          'sidebar-text': '#7f849c',
          'text-0': '#cdd6f4',
          'text-1': '#7f849c',
          'text-2': '#7f917e',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/2e/b9/82/2eb9824deb6c080a504711f0b073f71b.gif',
          'https://64.media.tumblr.com/3df2c199219112f5b66dba3e47b0f468/tumblr_pbm3m20VYf1tddn6to1_540.gif',
          'https://cdn.discordapp.com/attachments/947387501784494100/1239477800163872810/image.png?ex=66431127&is=6641bfa7&hm=c77aacffe9e40f3f6fc9034a31455e79dad4ef7eff992901f5194f9eaf990800&',
          'https://pbs.twimg.com/media/ET9zvh4WsAQlH2T?format=jpg&name=large',
          'https://img.wattpad.com/caa1be4c5c3ef6c864c9298b0a53fa97ed5f33f1/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f313054414d4b5772654e414735773d3d2d3739343530373331302e313563643839623462313030623935333837353137303239343736372e676966',
          'https://media.discordapp.net/attachments/947387501784494100/1239477405572136990/image.png?ex=664310c9&is=6641bf49&hm=739cf93001c39cf4e8db305223deb2eeca4d26d4c6676cb60ade5419af265006&=&format=webp&quality=lossless&width=2160&height=886',
        ],
        card_colors: [
          '#91aedb',
          '#7b98c6',
          '#6582b1',
          '#4e6c9c',
          '#385687',
          '#224172',
          '#91aedb',
          '#7b98c6',
          '#6582b1',
        ],
        custom_font: { family: "'DM Sans'", link: 'DM+Sans:wght@400;700' },
      },
      preview:
        'https://pbs.twimg.com/media/ET9zvh4WsAQlH2T?format=jpg&name=large',
    },
    {
      color: 'blue',
      score: 4440,
      title: 'Evangelion by ollie',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#181825',
          'background-1': '#181825',
          'background-2': '#1e1e2e',
          borders: '#4f5463',
          links: '#fafafa',
          sidebar: 'linear-gradient(#ff7b00, #000000)',
          'sidebar-text': '#ffffff',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#f7f7f7',
        },
        custom_cards: [
          'https://media.giphy.com/media/2lAquPl05GqQ4R7YsZ/giphy.gif?cid=790b7611ak6v5tq01s0bdi8919hk0688qu0n4fp4zxb7k8r8&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/EdknuaSGx7H0Y/giphy.gif?cid=ecf05e47d6pgh36rsysuap7676efuczzuwwf4ed3wdbtvq7r&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/4RbZ8cZYuApO0/giphy.gif?cid=790b7611ak6v5tq01s0bdi8919hk0688qu0n4fp4zxb7k8r8&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/cjG98gMyj574A/giphy.gif?cid=790b7611ak6v5tq01s0bdi8919hk0688qu0n4fp4zxb7k8r8&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/3hudn2QiNrH1u/giphy.gif?cid=ecf05e47d6pgh36rsysuap7676efuczzuwwf4ed3wdbtvq7r&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/wGUpSQWxnYpji/giphy.gif?cid=ecf05e47yaq1aq1ityos3il4aeh7brfxhblntzpb7hy0fght&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/1dBOHESEOYQa4/giphy.gif?cid=ecf05e4794vgqmwcivic83fytg520x38hosv3jk3yszqy3c6&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/sUP52mudix9Zu/giphy.gif?cid=ecf05e47tr530j2zijmg3z6b3uky4t4xedtzd8p2hhfsep04&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWs2djV0cTAxczBiZGk4OTE5aGswNjg4cXUwbjRmcDR6eGI3azhyOCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/9IQYNSvV0kISY/giphy.gif',
          'https://media.giphy.com/media/azXjFdh7FCfv2/giphy.gif?cid=ecf05e4794vgqmwcivic83fytg520x38hosv3jk3yszqy3c6&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/10MZQQpiRmXsDS/giphy.gif?cid=ecf05e47tr530j2zijmg3z6b3uky4t4xedtzd8p2hhfsep04&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/IbYstjFtVvcWc/giphy.gif?cid=ecf05e47tr530j2zijmg3z6b3uky4t4xedtzd8p2hhfsep04&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/141IT7TDZlalFu/giphy.gif?cid=ecf05e47tr530j2zijmg3z6b3uky4t4xedtzd8p2hhfsep04&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExYWs2djV0cTAxczBiZGk4OTE5aGswNjg4cXUwbjRmcDR6eGI3azhyOCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/bSgKBZKCxh8Iqlwxne/giphy.gif',
        ],
        card_colors: [
          '#ffc971',
          '#ffb627',
          '#ff9505',
          '#e2711d',
          '#cc5803',
          '#ffc971',
          '#ffb627',
          '#ff9505',
          '#e2711d',
          '#cc5803',
          '#ffc971',
          '#ffb627',
          '#ff9505',
          '#e2711d',
        ],
        custom_font: { family: "'Open Sans'", link: 'Open+Sans:wght@400;700' },
      },
      preview:
        'https://media.giphy.com/media/3hudn2QiNrH1u/giphy.gif?cid=ecf05e47d6pgh36rsysuap7676efuczzuwwf4ed3wdbtvq7r&ep=v1_gifs_search&rid=giphy.gif&ct=g',
    },
    {
      color: 'pink',
      score: 2230,
      title: 'Case143 by Maraya',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ff99ca',
          'background-1': '#fe7cbb',
          'background-2': '#fe3485',
          borders: '#ff007b',
          links: '#fea9d6',
          sidebar: '#ff669c',
          'sidebar-text': '#000000',
          'text-0': '#000000',
          'text-1': '#000000',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://cdn-2.tstatic.net/kaltim/foto/bank/images/straykisd-case.jpg',
          'https://i.ytimg.com/vi/VUJpgWpLQw8/maxresdefault.jpg',
          'https://pbs.twimg.com/media/FecQNKoaEAE1kIp.jpg',
          'https://th.bing.com/th/id/OIP.66DLRd5dAa987znke5CQxQHaEc?rs=1&pid=ImgDetMain',
          'https://th.bing.com/th/id/OIP.AiwKg3OXFOPUI-rChmydFAHaEM?w=268&h=180&c=7&r=0&o=5&pid=1.7',
          'https://i.pinimg.com/originals/5f/65/64/5f6564d963c222612023b906c30fce55.jpg',
          'https://th.bing.com/th/id/OIP.8NEFEparlrwGzGfv0fxDfAAAAA?rs=1&pid=ImgDetMain',
        ],
        card_colors: [
          '#ff0a54',
          '#ff5c8a',
          '#ff85a1',
          '#ff99ac',
          '#fbb1bd',
          '#ff0a54',
          '#ff5c8a',
        ],
        custom_font: { family: "'Caveat'", link: 'Caveat:wght@400;700' },
      },
      preview:
        'https://th.bing.com/th/id/OIP.66DLRd5dAa987znke5CQxQHaEc?rs=1&pid=ImgDetMain',
    },
    {
      color: 'green',
      score: 4440,
      title: 'Ghibli by Kai',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#2f3e46',
          'background-1': '#354f52',
          'background-2': '#52796f',
          borders: '#84a98c',
          links: '#d8f5c7',
          sidebar: 'linear-gradient(#324b4e, #91b19f)',
          'sidebar-text': '#cadfbf',
          'text-0': '#e2e8de',
          'text-1': '#cad2c5',
          'text-2': '#adb1aa',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/7c/00/2e/7c002ec7ca9c96efdc0edef0244ec658.jpg',
          'https://i.pinimg.com/originals/de/32/ca/de32ca0df25cf408343ece399e5aceed.gif',
          'https://i.pinimg.com/564x/7e/60/64/7e6064201d74a0d749f25001de07b848.jpg',
          'https://i.pinimg.com/564x/e4/b5/29/e4b5297f5915b6b5434843864358e96c.jpg',
          'https://i.pinimg.com/originals/35/2c/3e/352c3e86a36a5fb07aacf52a3349f4ce.gif',
          'https://i.pinimg.com/originals/59/38/82/593882835a372b2d9cc474a0347a4638.gif',
          'https://i.pinimg.com/564x/4c/36/82/4c3682e4e4902b54899ba2d52fc861d0.jpg',
          'https://i.pinimg.com/564x/ea/5f/7b/ea5f7b2234ae51725c222737377de114.jpg',
          'https://i.pinimg.com/564x/78/aa/f1/78aaf18b114bd9ce8b3eacd65e06903b.jpg',
        ],
        card_colors: [],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://i.pinimg.com/736x/7c/00/2e/7c002ec7ca9c96efdc0edef0244ec658.jpg',
    },
    {
      color: 'green',
      score: 3440,
      title: 'KikisDelivery by Matie',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#2f3e46',
          'background-1': '#354f52',
          'background-2': '#52796f',
          borders: '#84a98c',
          links: '#d8f5c7',
          sidebar: '#354f52',
          'sidebar-text': '#e2e8de',
          'text-0': '#e2e8de',
          'text-1': '#cad2c5',
          'text-2': '#adb1aa',
        },
        custom_cards: [
          'https://media1.tenor.com/m/mmP_MNiRWCwAAAAC/cats-black.gif',
          'https://media1.tenor.com/m/_xsLtiCjbAQAAAAd/kikis-delivery-service-cats.gif',
          'https://media.tenor.com/oABoYJfl05kAAAAM/majonotakkyubin-kikisdelivery.gif',
          'https://media1.tenor.com/m/R7a0AjgHUZ4AAAAC/cat-kitty.gif',
        ],
        card_colors: ['#dbc0c0', '#bfbcac', '#a3b899', '#dbc0c0'],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://media.tenor.com/oABoYJfl05kAAAAM/majonotakkyubin-kikisdelivery.gif',
    },
    {
      color: 'gray',
      score: 4340,
      title: 'SleepToken by Jaya',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#272625',
          'background-1': '#282624',
          'background-2': '#1e1a1a',
          borders: '#423e3e',
          links: '#ebe0cb',
          sidebar:
            'linear-gradient(#ffeed6c7, #000000c7), center url("https://i.imgur.com/RnMvKQi.png")',
          'sidebar-text': '#2a1818',
          'text-0': '#ffffff',
          'text-1': '#d3c5c5',
          'text-2': '#f7cfcf',
        },
        custom_cards: [
          'https://64.media.tumblr.com/ecf9dad5d4500ead93117ce9ebc4bb14/8862a591e342b05c-bc/s1280x1920/e576920cd25562a2892b7f36c55ddc12aebecfe8.jpg',
          'https://64.media.tumblr.com/8794eb14eed2965a3a762cef19d0c35e/8862a591e342b05c-ed/s1280x1920/cfd28223f0ba2fbc19950cde4bd6360c40abfdb8.jpg',
          'https://64.media.tumblr.com/c07394ec9efdce1c6a83377e2b90bbef/8862a591e342b05c-56/s1280x1920/4133d3e8c56972808702f7c13515c7d4757af2c7.jpg',
          'https://64.media.tumblr.com/de618a515655e09d0599799f41dff9ad/8862a591e342b05c-f9/s1280x1920/deb07620f177047c686ed28f5e4b7423fed82381.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRs-2wkDoNU0nNccopr0ukdc5PvwjiTZW1H9Q&usqp=CAU',
          'https://64.media.tumblr.com/f8486471974053a18c8bd8e9b857510c/48fd2581bea638b3-f5/s2048x3072/325877f77f1ac783c71673fd1fcb47e76de6fbac.webp',
        ],
        card_colors: [
          '#ffffff',
          '#000000',
          '#ffffff',
          '#000000',
          '#ffffff',
          '#000000',
          '#ffffff',
          '#000000',
          '#ffffff',
        ],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRs-2wkDoNU0nNccopr0ukdc5PvwjiTZW1H9Q&usqp=CAU',
    },
    {
      color: 'blue',
      score: 3430,
      title: 'Medical by Emberli',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#3b5272',
          'background-1': '#1a2026',
          'background-2': '#212930',
          borders: '#000000',
          links: '#809cb7',
          sidebar: 'linear-gradient(#0033ff, #000000)',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/61/1c/32/611c32cd30d311b863d12910d416f2e2.jpg',
          'https://i.pinimg.com/564x/7e/8f/da/7e8fda50c06fe88b8b271769def00174.jpg',
          'https://i.pinimg.com/564x/61/ca/5c/61ca5cd4648e85ebd691f64d022ba08c.jpg',
          'https://i.pinimg.com/736x/06/fd/57/06fd57527b55534493127399d766e3cb.jpg',
          'https://i.pinimg.com/564x/70/97/86/709786e04275ed30bf40c6b3816eda03.jpg',
          'https://i.pinimg.com/564x/6f/13/d3/6f13d372f6c3394afb66d457af3c06c1.jpg',
          'https://i.pinimg.com/564x/46/3e/e8/463ee85d7aecb285c201b3ef94549e03.jpg',
        ],
        card_colors: ['#ffffff'],
        custom_font: {
          family: "'emberlimichelle'",
          link: 'emberlimichelle:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/46/3e/e8/463ee85d7aecb285c201b3ef94549e03.jpg',
    },
    {
      color: 'green',
      score: 4440,
      title: 'Slytherin by Amara',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#204620',
          'background-1': '#000000',
          'background-2': '#141414',
          borders: '#1e1e1e',
          links: '#7CF3CB',
          sidebar: '#0c0c0c',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://wallpaper-mania.com/wp-content/uploads/2018/09/High_resolution_wallpaper_background_ID_77700634319.jpg',
          'https://th.bing.com/th/id/OIP.yjgg4YnmO8e6gn0bZ5xHbQAAAA?rs=1&pid=ImgDetMain',
          'https://wallpapercave.com/wp/wp7771889.jpg',
          'https://wallpapercave.com/wp/wp7798061.jpg',
          'https://e0.pxfuel.com/wallpapers/259/194/desktop-wallpaper-harry-potter-background-cool-slytherin.jpg',
          'https://i0.wp.com/wallpaperaccess.com/full/5116179.png',
          'https://wallpapercave.com/wp/wp7914236.jpg',
          'https://wallpapercave.com/wp/wp9058608.jpg',
          'https://wallpapercave.com/wp/wp8741004.jpg',
          'https://wallpapercave.com/wp/wp7009932.jpg',
        ],
        card_colors: ['#080821'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://th.bing.com/th/id/OIP.yjgg4YnmO8e6gn0bZ5xHbQAAAA?rs=1&pid=ImgDetMain',
    },
    {
      color: 'lightgreen',
      score: 4440,
      title: 'gardenofwords by hikari',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#9fb7a5',
          'background-1': '#b4c3b1',
          'background-2': '#d5e7d8',
          borders: '#253128',
          links: '#22321f',
          sidebar:
            'linear-gradient(#05230ac7, #2a372bc7), center url("https://i.pinimg.com/originals/f1/1c/98/f11c98c4873bc141d90780c7eae9357e.gif")',
          'sidebar-text': '#b1c9b2',
          'text-0': '#173e09',
          'text-1': '#1a2b18',
          'text-2': '#475c49',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/d3/c7/6c/d3c76cd994b55a8121353ca95e292b9a.gif',
          'https://i.pinimg.com/originals/86/5e/62/865e6298137383b1ae23ddfed9893079.gif',
          'https://i.pinimg.com/originals/34/2e/54/342e54745ad0d90d7a9d3984dcaf318a.gif',
          'https://i.pinimg.com/originals/f7/2c/2e/f72c2e892d773085bb1f2fc42a7f285c.gif',
          'https://i.pinimg.com/originals/97/78/a8/9778a876f33f7431544ab0dbe113424e.gif',
          'https://i.pinimg.com/originals/df/e2/61/dfe2616671565bd2e8b65197f85fc0fc.gif',
          'https://i.pinimg.com/originals/12/a1/6b/12a16b88304b04fcdaa0ba410950c0ba.gif',
          'https://i.pinimg.com/originals/c0/92/a1/c092a18714b5e6da80ed771e9691dd59.gif',
          'https://i.pinimg.com/originals/f4/0f/da/f40fdae8c703902be676aff64eea0649.gif',
          'https://i.pinimg.com/originals/d6/dc/d1/d6dcd1171fd201b16e3b9a31af488b1e.gif',
          'https://i.pinimg.com/originals/6b/f4/a1/6bf4a1f2ead5ad7b7617b47d402252a7.gif',
          'https://i.pinimg.com/originals/09/b4/e9/09b4e9a90c4bdd79d08566a9dbf41e7e.gif',
          'https://i.pinimg.com/originals/9b/d9/08/9bd9087d816361823821a233827b187f.gif',
        ],
        card_colors: ['#284328'],
        custom_font: { family: "'Lora'", link: 'Lora:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/c0/92/a1/c092a18714b5e6da80ed771e9691dd59.gif',
    },
    {
      color: 'green',
      score: 4340,
      title: 'Invaderzim by Ashley',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#31453e',
          'background-1': '#43604e',
          'background-2': '#233833',
          borders: '#94bc9d',
          links: '#2f9875',
          sidebar: '#3b5430',
          'sidebar-text': '#b9dea1',
          'text-0': '#dfe6db',
          'text-1': '#d0e2c5',
          'text-2': '#313f3c',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/62/08/23/620823ee37a07e120f94f77e6c99aa82.jpg',
          'https://i.pinimg.com/564x/8b/24/2c/8b242cf29915e9a9afe0143940d6aaa8.jpg',
          'https://i.pinimg.com/originals/65/6b/bb/656bbb0aafe9fc909dc892a307ad88fa.gif',
          'https://i.pinimg.com/564x/44/e6/77/44e677451a741b974453c726e90c588b.jpg',
        ],
        card_colors: [
          '#610345',
          '#107e7d',
          '#044b7f',
          '#e3b505',
          '#95190c',
          '#610345',
          '#107e7d',
          '#044b7f',
          '#e3b505',
          '#95190c',
          '#610345',
          '#107e7d',
          '#044b7f',
        ],
        custom_font: { family: "'Jost'", link: 'Jost:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/44/e6/77/44e677451a741b974453c726e90c588b.jpg',
    },
    {
      color: 'gray',
      score: 3440,
      title: 'Astronomy by Isabelle',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#11111b',
          'background-1': '#181825',
          'background-2': '#1e1e2e',
          borders: '#4f5463',
          links: '#f5c2e7',
          sidebar: '#181825',
          'sidebar-text': '#7f849c',
          'text-0': '#cdd6f4',
          'text-1': '#7f849c',
          'text-2': '#a6e3a1',
        },
        custom_cards: [
          'https://science.nasa.gov/wp-content/uploads/2023/09/crab-lg.jpeg?w=1536&format=webp',
          'https://science.nasa.gov/wp-content/uploads/2023/09/457046main-wise20100524-full.jpg?w=1536&format=webp',
          'https://science.nasa.gov/wp-content/uploads/2023/09/stsci-01f3n9k6pr8b5y9cz2qd7asqpt-1.png?w=1536&format=webp',
          'https://science.nasa.gov/wp-content/uploads/2023/09/ssc2006-02a-0.jpg?w=1536&format=webp',
          'https://science.nasa.gov/wp-content/uploads/2023/09/ssc2019-15b-med.jpg?w=1536&format=webp',
          'https://science.nasa.gov/wp-content/uploads/2023/09/stsci-01g8jzq6gwxhex15pyy60wdrsk-2.png?w=1536&format=webp',
          'https://science.nasa.gov/wp-content/uploads/2023/09/web-first-images-release.png?w=1536&format=webp',
          'https://science.nasa.gov/wp-content/uploads/2023/09/pia23865-2.jpg?w=1536&format=webp',
          'https://science.nasa.gov/wp-content/uploads/2023/09/stsci-01ga76rm0c11w977jrhgj5j26x-2.png?w=1536&format=webp',
        ],
        card_colors: [
          '#333954',
          '#3b405a',
          '#434661',
          '#4b4d67',
          '#52536d',
          '#5a5a74',
          '#62607a',
          '#6a6780',
          '#726e87',
        ],
        custom_font: {
          family: "'Inria Sans'",
          link: 'Inria+Sans:wght@400;700',
        },
      },
      preview:
        'https://science.nasa.gov/wp-content/uploads/2023/09/stsci-01g8jzq6gwxhex15pyy60wdrsk-2.png?w=1536&format=webp',
    },
    {
      color: 'black',
      score: 4430,
      title: 'F76PitBoy by Eli',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#000000',
          borders: '#000000',
          links: '#00ff04',
          sidebar: 'linear-gradient(#000000, #000000)',
          'sidebar-text': '#00ff04',
          'text-0': '#00ff04',
          'text-1': '#00ff04',
          'text-2': '#00ff04',
        },
        custom_cards: [
          'https://cdn.mos.cms.futurecdn.net/H4JDiSksCe6oYxBZYY6upQ-1200-80.jpg',
          'https://www.problematic.design/wp-content/uploads/elementor/thumbs/door-icon-ottp0pujp6y814yy7tyqn0sraitxh7nbut5we2zuo0.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfdffiPx93UsdfjVc364_PwPlIelFwQVfxGVBHZ82BGw&s',
          'https://i.kinja-img.com/image/upload/c_fill,h_675,pg_1,q_80,w_1200/46fa7f8c5e6b9e31f789f7902ee6515d.jpg',
          'https://www.savingcontent.com/wp-content/uploads/2015/11/Pip-Boy-status.png',
        ],
        card_colors: ['#000000'],
        custom_font: { family: "'Barlow'", link: 'Barlow:wght@400;700' },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfdffiPx93UsdfjVc364_PwPlIelFwQVfxGVBHZ82BGw&s',
    },
    {
      color: 'purple',
      score: 4340,
      title: 'Kuromi by JoJo!',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#352c59',
          'background-1': '#4b2876',
          'background-2': '#141414',
          borders: '#1e1e1e',
          links: '#a07cf4',
          sidebar: '#4a3f69',
          'sidebar-text': '#bdb2dc',
          'text-0': '#784eb7',
          'text-1': '#f2f2f3',
          'text-2': '#d0a4e5',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/b8/3e/bc/b83ebc77dd6388328d067a5e37e1b77a.jpg',
          'https://i.pinimg.com/564x/f0/cd/9a/f0cd9ab448b6de199aa55482797c0ce9.jpg',
          'https://i.pinimg.com/564x/a8/0a/f8/a80af8ea69fe14732001ee90f27a1907.jpg',
          'https://i.pinimg.com/736x/42/51/e1/4251e1e9a1474b51e50360ee14bc89e4.jpg',
          'https://i.pinimg.com/564x/82/72/27/8272274161f39cbbcdf143b063d179c9.jpg',
          'https://i.pinimg.com/564x/bf/23/25/bf2325689639363683916494cc0eef18.jpg',
          'https://i.pinimg.com/564x/e8/66/17/e86617ace5321eee76931ccd61109ad6.jpg',
          'https://i.pinimg.com/564x/e1/47/d9/e147d9a971d9c31b32be853f5a74af04.jpg',
          'https://i.pinimg.com/564x/69/34/c3/6934c3bc31cf40cb48f423e134dc3d01.jpg',
          'https://i.pinimg.com/564x/25/86/fa/2586fac9ab9ef1aa88741ee6d85c8e3d.jpg',
        ],
        card_colors: ['#a07cf4'],
        custom_font: {
          family: "'Patrick Hand'",
          link: 'Patrick+Hand:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/a8/0a/f8/a80af8ea69fe14732001ee90f27a1907.jpg',
    },
    {
      color: 'red',
      score: 4340,
      title: 'hellokitty by anna',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffd6d6',
          'background-1': '#e15b5b',
          'background-2': '#eeaaaa',
          borders: '#c25151',
          links: '#e61919',
          sidebar:
            'linear-gradient(#e1e0e0c7, #c89797c7), center url("https://th.bing.com/th/id/OIP.L79DXEf-CLSDrCpUMAvGRwHaLH?rs=1&pid=ImgDetMain")',
          'sidebar-text': '#ffffff',
          'text-0': '#e23c3c',
          'text-1': '#db2424',
          'text-2': '#eb2d2d',
        },
        custom_cards: [
          'https://i.gifer.com/embedded/download/Mvzg.gif',
          'https://media.tenor.com/ORpQUgwlW-IAAAAC/hello-kitty-reading.gif',
          'https://i.pinimg.com/originals/ae/42/64/ae42643a985d13e0b9d6cb5b0c7ca752.gif',
          'https://i.pinimg.com/originals/92/1a/6a/921a6a098dd941d17e18f5d02054109d.gif',
          'https://media.tenor.com/fRWydVDaoG8AAAAC/hellokitty-hello.gif',
          'https://i.pinimg.com/originals/18/cd/6f/18cd6f18d2614d54b9642dbdff29fd04.gif',
          'https://media.tenor.com/uoO2tRx29jYAAAAC/hello-kitty.gif',
          'https://i.gifer.com/Nm8R.gif',
          'https://gifdb.com/images/thumbnail/hello-kitty-just-woke-up-lwxlstk3zv5jij43.gif',
        ],
        card_colors: ['#c14444'],
        custom_font: { family: "'Poppins'", link: 'Poppins:wght@400;700' },
      },
      preview:
        'https://gifdb.com/images/thumbnail/hello-kitty-just-woke-up-lwxlstk3zv5jij43.gif',
    },
    {
      color: 'blue',
      score: 4340,
      title: 'beachvibes by brittany',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#4a606d',
          'background-1': '#5d7689',
          'background-2': '#4b5977',
          borders: '#985252',
          links: '#b19191',
          sidebar: 'linear-gradient(#c9a6a6, #985252)',
          'sidebar-text': '#d8d0d0',
          'text-0': '#d6b3b3',
          'text-1': '#dbadd3',
          'text-2': '#974e4e',
        },
        custom_cards: [
          'https://wallpapers.com/images/high/soft-aesthetic-1920-x-1080-background-k4lr2rwt6syhm2qp.webp',
          'https://preview.redd.it/00zi32egt5781.jpg?width=1080&crop=smart&auto=webp&s=ea1f33d11906c073d17d70ae7f374da67045b95f',
          'https://wallpapers.com/images/high/soft-aesthetic-2432-x-1621-background-c3dog6lvz2p6o4i7.webp',
          'https://wallpapers.com/images/hd/pink-beach-aesthetic-4ev6lmclhi6g56ms.jpg',
        ],
        card_colors: ['#9e8a9a'],
        custom_font: { family: "'Epilogue'", link: 'Epilogue:wght@400;700' },
      },
      preview:
        'https://wallpapers.com/images/high/soft-aesthetic-1920-x-1080-background-k4lr2rwt6syhm2qp.webp',
    },
    {
      color: 'purple',
      score: 3430,
      title: 'JJK by bananabread',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#130f1a',
          'background-1': '#59476b',
          'background-2': '#b4d8f3',
          borders: '#3c3c3c',
          links: '#ffffff',
          sidebar:
            'linear-gradient(#8792c0c7, #000000c7), center url("https://pbs.twimg.com/media/F2f_Vu9asAApiwo.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#62cafe',
          'text-1': '#ffffff',
          'text-2': '#d774fb',
        },
        custom_cards: [
          'https://preview.redd.it/whats-your-jjk-hot-take-v0-d0gg9xaqevrb1.jpg?auto=webp&s=726ec5e342bfd8ba941af8b3e752fa3568de5358 ',
          'https://preview.redd.it/is-that-a-jojo-reference-v0-nl1jhuf2ur0c1.png?width=1334&format=png&auto=webp&s=b9aa9cd4bcd34c16ac53fc5c16030555bb6caef8 ',
          'https://fin.co.id/upload/b351c423fdee21f2a0109542313f6a08.jpg',
          'https://preview.redd.it/did-a-redraw-of-sukuna-from-a-personal-favorite-shot-of-v0-5z15o6n1hy3c1.png?width=640&crop=smart&auto=webp&s=d5c8f51271a7a0b6d1e3ac9156dbe5cb8092d10b',
          'https://a.storyblok.com/f/178900/960x540/549f98d47d/nobara-and-megumi.png/m/filters:quality(95)format(webp)',
          'https://static0.gamerantimages.com/wordpress/wp-content/uploads/2023/08/jujutsu-kaisen-season-2-episode-4-hollow-purple.jpg ',
          'https://static1.srcdn.com/wordpress/wp-content/uploads/2023/12/yuji-defeats-mahito-in-jujutsu-kaisen.jpg',
          'https://static1.dualshockersimages.com/wordpress/wp-content/uploads/2023/12/todo-in-jjk-season-2.jpg',
          'https://static.wikia.nocookie.net/cee7a93e-9517-4aea-b4fd-0cca8dc2a3ea/scale-to-width/755',
          'https://i0.wp.com/www.spielanime.com/wp-content/uploads/2023/09/JJK-manga-Is-Sukuna-secretly-the-main-character-1.webp?fit=1024%2C576&ssl=1',
          'https://i.kym-cdn.com/entries/icons/original/000/046/701/Screenshot_(308).png',
          'https://cdn.idntimes.com/content-images/duniaku/post/20231103/untitled-0637d5ccf62edbb3ab44bbab9ec9cf9b.png',
        ],
        card_colors: ['#62cafe'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://preview.redd.it/did-a-redraw-of-sukuna-from-a-personal-favorite-shot-of-v0-5z15o6n1hy3c1.png?width=640&crop=smart&auto=webp&s=d5c8f51271a7a0b6d1e3ac9156dbe5cb8092d10b',
    },
    {
      color: 'lightgreen',
      score: 2340,
      title: 'Snoopy by Ineke',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#cfecd0',
          'background-1': '#e28d8d',
          'background-2': '#f3a5a5',
          borders: '#e99595',
          links: '#e99595',
          sidebar: '#e9bebe',
          'sidebar-text': '#e99595',
          'text-0': '#e99595',
          'text-1': '#e99595',
          'text-2': '#e99595',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/1c/68/3a/1c683aab861b1d8377b61a55ce0ae6c0.jpg',
          'https://i.pinimg.com/564x/f8/53/b9/f853b9d95866507a5ba4750c88987302.jpg',
          'https://i.pinimg.com/564x/26/1c/be/261cbe0e6cf57e1d71e9627be1bb12a0.jpg',
          'https://i.pinimg.com/564x/b7/27/d1/b727d1a4cac892e57fd55da33339fb18.jpg',
          'https://i.pinimg.com/originals/0e/c4/8b/0ec48b9e5f6fb53de5c86dc7c90a9dec.gif',
          'https://i.pinimg.com/564x/8a/8f/72/8a8f728e24c2a71ad8867d86845caf6b.jpg',
          'https://i.pinimg.com/564x/cf/b6/c4/cfb6c421638cacbca05759edd1dc9acf.jpg',
          'https://i.pinimg.com/564x/87/1d/13/871d133c1fa7626815a96c8286898dbe.jpg',
          'https://i.pinimg.com/564x/66/f9/4b/66f94b2fedc950293dfe7ee395571a0c.jpg',
        ],
        card_colors: [
          '#ff69eb',
          '#ff86c8',
          '#ffa3a5',
          '#ffbf81',
          '#ffdc5e',
          '#ff69eb',
          '#ff86c8',
          '#ffa3a5',
          '#ffbf81',
        ],
        custom_font: {
          family: "'Barriecito'",
          link: 'Barriecito:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/b7/27/d1/b727d1a4cac892e57fd55da33339fb18.jpg',
    },
    {
      color: 'beige',
      score: 4441,
      title: 'txtromantic by alex',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#d7cbba',
          'background-1': '#b9a78c',
          'background-2': '#cfbaa6',
          borders: '#604038',
          links: '#9b7a58',
          sidebar: '#4d3a3b',
          'sidebar-text': '#f5f5f5',
          'text-0': '#3a2425',
          'text-1': '#432a28',
          'text-2': '#52362c',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/18/99/c9/1899c9ac54ba5469b9ea5dc6d6bcef77.jpg',
          'https://i.pinimg.com/originals/d4/83/84/d48384f8fa80f234ad98bea9041d5afe.jpg',
          'https://i.pinimg.com/originals/37/8f/91/378f91b9bb278ecdd44be60a58132d44.jpg',
          'https://i.pinimg.com/originals/0b/57/81/0b5781f92bf543d7584342f4d26cc067.jpg',
          'https://i.pinimg.com/originals/ef/d2/79/efd2797220edeefff8fd2c0ae56cb85d.jpg',
          'https://i.pinimg.com/originals/c5/e4/92/c5e492b667e9eaf3f2a12c8137b2cbe5.jpg',
        ],
        card_colors: ['#3a2425'],
        custom_font: { family: "'Cinzel'", link: 'Cinzel:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/18/99/c9/1899c9ac54ba5469b9ea5dc6d6bcef77.jpg',
    },
    {
      color: 'gray',
      score: 4440,
      title: 'TokioHotel by Ian',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#101010',
          'background-1': '#121212',
          'background-2': '#1a1a1a',
          borders: '#272727',
          links: '#ababab',
          sidebar: '#121212',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/ff/40/3c/ff403c2d4abf2d56b3bb2b019d14fce1.gif',
          'https://i.pinimg.com/originals/74/a0/6e/74a06e8ca7c3b4b9c570c301e87904ed.gif',
          'https://i.pinimg.com/originals/38/f5/6a/38f56a036cba449b424224b43a9366b3.gif',
          'https://i.pinimg.com/originals/80/3d/e5/803de5c85b7742b8db02063c80f4450a.gif',
          'https://i.pinimg.com/originals/53/04/72/530472a291b80f5427ecb93844d1a54e.gif',
          'https://i.pinimg.com/originals/fc/fe/d1/fcfed1ffa462e9531363affb89790df3.gif',
          'https://i.pinimg.com/originals/fd/a0/7c/fda07c31af89a2af801521109d1fe2a5.gif',
          'https://i.pinimg.com/originals/7a/1d/94/7a1d945396c4692f7d851dd6e05ed899.gif',
        ],
        card_colors: ['#000000'],
        custom_font: { family: "'Karla'", link: 'Karla:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/7a/1d/94/7a1d945396c4692f7d851dd6e05ed899.gif',
    },
    {
      color: 'pink',
      score: 4340,
      title: 'Kirby by Carolyn',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#FFE4E1',
          'background-1': '#FFF0F5',
          'background-2': '#FFE4E1',
          borders: '#DCDCDC',
          links: '#DB7093',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://giffiles.alphacoders.com/215/215751.gif")',
          'sidebar-text': '#F08080',
          'text-0': '#F08080',
          'text-1': '#696969',
          'text-2': '#778899',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/e6/9f/1d/e69f1dd00ade9de2ee056237b32cfd31.jpg',
          'https://i.imgflip.com/5uv3v3.gif',
          'https://www.gifcen.com/wp-content/uploads/2022/05/kirby-gif-7.gif',
          'https://media0.giphy.com/media/o8U8XZZIA7czZOf1j5/giphy.gif',
          'https://gifdb.com/images/high/kirby-and-bandana-waddle-dee-qs8plc2a4judase2.gif',
          'https://img3.gelbooru.com/images/73/b2/73b2fe41d793c3dcc7b9dc422d1766e5.gif',
        ],
        card_colors: ['#e56182'],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview: 'https://i.imgflip.com/5uv3v3.gif',
    },
    {
      color: 'yellow',
      score: 3230,
      title: 'Invincible by Jacob',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffe556',
          'background-1': '#00bcf0',
          'background-2': '#ffe556',
          borders: '#ffffff',
          links: '#303539',
          sidebar: '#00bcf0',
          'sidebar-text': '#f5f5f5',
          'text-0': '#0',
          'text-1': '#0',
          'text-2': '#0',
        },
        custom_cards: [
          'https://assets.skybound.com/wp-content/uploads/2023/07/11004537/Invincible-header-image.jpg',
          'https://static1.cbrimages.com/wordpress/wp-content/uploads/2022/08/Omni-Man-Mark-Grayson-Invincible.jpg',
        ],
        card_colors: ['#00bcf0'],
        custom_font: {
          family: "'Permanent Marker'",
          link: 'Permanent+Marker:wght@400;700',
        },
      },
      preview:
        'https://static1.cbrimages.com/wordpress/wp-content/uploads/2022/08/Omni-Man-Mark-Grayson-Invincible.jpg',
    },
    {
      color: 'purple',
      score: 2230,
      title: 'Wolves by Wolfy24o',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#21203c',
          'background-1': '#644f92',
          'background-2': '#34336b',
          borders: '#241b37',
          links: '#98e7fb',
          sidebar: 'linear-gradient(#644f92, #21203c)',
          'sidebar-text': '#ffffff',
          'text-0': '#ffffff',
          'text-1': '#a2f1a7',
          'text-2': '#fefba9',
        },
        custom_cards: [
          'https://wallpapers-clan.com/wp-content/uploads/2023/12/wolf-in-purple-night-forest-desktop-wallpaper-preview.jpg',
          'https://wallpapers-clan.com/wp-content/uploads/2023/11/wolf-in-the-night-forest-desktop-wallpaper-preview.jpg',
          'https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSU5lk_oEmot-2KcyydcctmjTM5YaTvjv0DkLdNpmKLfUrN43W6',
          'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQQ4WTZKq0rFni9bbaa3duhc2jwioLlZ_RlKwU2TQre19pgzbFu',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjlUxJ3je5UYurJwcVKeklxRsVfPy55op3uMhqG9oY5_aY-9tg',
          'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRWbrPfa9HRItsoBc8NhOnGPCWM0ALaB_VrDMh8bl78MUerOMLn',
          'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ_wTeGKHXepny0wyQAIgkyzeusbAXSwz1ZsnxRIi0aCpeFvAdg',
        ],
        card_colors: ['#70d6ff', '#ff70a6', '#ff9770', '#ffd670', '#e9ff70'],
        custom_font: {
          family: "'Happy Monkey'",
          link: 'Happy+Monkey:wght@400;700',
        },
      },
      preview:
        'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ_wTeGKHXepny0wyQAIgkyzeusbAXSwz1ZsnxRIi0aCpeFvAdg',
    },
    {
      color: 'brown',
      score: 4440,
      title: 'Academica by Sandy',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#29221f',
          'background-1': '#2a201d',
          'background-2': '#312421',
          borders: '#63574f',
          links: '#b08290',
          sidebar: '#191614',
          'sidebar-text': '#9b867d',
          'text-0': '#f1e7e5',
          'text-1': '#9b867d',
          'text-2': '#93bc8f',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/4f/d0/55/4fd055c65d6783ebb381a231d373d411.png',
          'https://images.pexels.com/photos/4346325/pexels-photo-4346325.jpeg?cs=srgb&dl=pexels-ioanamtc-4346325.jpg&fm=jpg',
          'https://64.media.tumblr.com/53304691ab8c0b03a15517a848875eca/9db3d534cdd6be01-66/s640x960/0983aecb18952d3bdae70275135754ed18eb3646.jpg',
          'https://i.pinimg.com/736x/2f/78/f0/2f78f04c9409ba967f4c65b79634f66b.jpg',
          'https://i.pinimg.com/736x/29/d7/70/29d7704c85c6b86c3312a63d1271a69d.jpg',
        ],
        card_colors: ['#6b705c', '#a5a58d', '#b7b7a4', '#ffe8d6', '#ddbea9'],
        custom_font: { family: "'Lora'", link: 'Lora:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/736x/29/d7/70/29d7704c85c6b86c3312a63d1271a69d.jpg',
    },
    {
      color: 'pink',
      score: 4340,
      title: 'Duck by Andrea',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fde3e3',
          'background-1': '#f3cece',
          'background-2': '#b89494',
          borders: '#a48e8e',
          links: '#bf9b9b',
          sidebar: '#a58383',
          'sidebar-text': '#ffffff',
          'text-0': '#6b5757',
          'text-1': '#483737',
          'text-2': '#534646',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/7d/84/22/7d8422eda9ecbad45096196c1e365d79.jpg',
          'https://i.pinimg.com/736x/a5/4a/5f/a54a5fadb12af205daa2a6d3c0151770.jpg',
          'https://i.pinimg.com/564x/97/66/69/97666944e879a0c8f871a1f207f29dcd.jpg',
          'https://i.pinimg.com/564x/db/60/ce/db60ce67cf9fcd6820c1845cb7001193.jpg',
          'https://i.pinimg.com/736x/b1/90/29/b19029644b9a7d88104f4d73977af781.jpg',
          'https://i.pinimg.com/564x/b9/4c/43/b94c43e8041291159d93f5f10ca10229.jpg',
          'https://i.pinimg.com/564x/11/cf/d3/11cfd37da0db82f8c5fdb3ffb676b95e.jpg',
          'https://i.pinimg.com/564x/94/45/17/944517d6365bd18c194990956699f81f.jpg',
          'https://i.pinimg.com/564x/0f/3a/16/0f3a168e5500e51ae776e36e94409be5.jpg',
          'https://i.pinimg.com/564x/23/ef/51/23ef512f369b4cbf3c192be2eb69f961.jpg',
          'https://i.pinimg.com/564x/25/00/72/250072dcf5707e1e43ddbe52fa62e6a7.jpg',
          'https://i.pinimg.com/564x/01/27/d7/0127d7d205a03fc2986e32dcc48596cf.jpg',
          'https://i.pinimg.com/564x/02/79/93/02799347aec561758b145ffa284f0430.jpg',
        ],
        card_colors: ['#f2f1c4', '#e6e5c1', '#c4c27c', '#dbd863', '#ffffff'],
        custom_font: {
          family: "'Happy Monkey'",
          link: 'Happy+Monkey:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/02/79/93/02799347aec561758b145ffa284f0430.jpg',
    },
    {
      color: 'green',
      score: 3440,
      title: 'InBloomZB1 by klaire',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#a3c79e',
          'background-1': '#9dc6d8',
          'background-2': '#2e5224',
          borders: '#0e2011',
          links: '#1f4d60',
          sidebar: '#6a8566',
          'sidebar-text': '#1f4d60',
          'text-0': '#1f4d60',
          'text-1': '#1f4d60',
          'text-2': '#1f4d60',
        },
        custom_cards: [
          'https://staging.cohostcdn.org/attachment/cf31a437-a2d5-459d-a4c8-56fcbb38e14a/zb1door.gif',
          'https://64.media.tumblr.com/29ca97fc317ef2d78ec8b37b249cdd6f/95430d011f915c25-f0/s540x810/37b95607adf35be9d6dc9bbc89fb8cf1c9f00b4b.gif',
          'https://media.tenor.com/BKFj2B_2xasAAAAM/zerobaseone-in-bloom.gif',
          ' https://64.media.tumblr.com/a55445d8d404bbcff144831305c7ca69/95430d011f915c25-d6/s540x810/2fa0061379af6b497a89a4f540f575e0e30747e8.gifv',
          'https://64.media.tumblr.com/7b4454de4260ef2ffef9ff914ee6dca1/95430d011f915c25-15/s540x810/b4139288ea365d2c5073e5748ee382cfa90452c3.gifv',
        ],
        card_colors: [],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://media.tenor.com/BKFj2B_2xasAAAAM/zerobaseone-in-bloom.gif',
    },
    {
      color: 'black',
      score: 2330,
      title: 'fromsoftware by SatyrLegz',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#350303',
          'background-2': '#5e5661',
          borders: '#140e21',
          links: '#ac8b53',
          sidebar:
            'linear-gradient(#372020c7, #2f2c30c7), center url("https://static.displate.com/857x1200/displate/2020-08-13/8812c0941dd76bd3b1df67bb88249249_b14088eef3ad5124795a7d60d78e5ba6.jpg")',
          'sidebar-text': '#f2f2f2',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://media.tenor.com/QrDqACQnwEYAAAAM/mohg.gif',
          'https://64.media.tumblr.com/2f2b6ff30692158741383ea4405d18d2/539887b20e3f2837-a1/s540x810/2b11b353986414e569e320a856ea46b9cb2374db.gifv',
          'https://media.tenor.com/owLNL9ambQcAAAAM/burnt-ivory-king-ivory-king.gif',
          'https://64.media.tumblr.com/28c2cd396ae11e9ff22515c7829c30e7/7ac5813952b89422-7d/s540x810/f2e28b7aa32dc02d411303f905a06a3de3360048.gifv',
          'https://i.imgur.com/ZaRMlIl.gif',
          'https://media1.tenor.com/m/YNMFjchPlygAAAAd/darksouls-soulsborne.gif',
          'https://media2.giphy.com/media/XsOyKnzVnHlXDOWcAX/giphy.gif?cid=6c09b9520u47bkmjqg6grb6pw5b2d8iqd3j9pzp8idfi30je&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=g',
          'https://media1.giphy.com/media/iamIahPLWmo4tGiyDz/200w.webp',
          'https://i.makeagif.com/media/4-08-2019/sVbn90.gif',
        ],
        card_colors: [
          '#e01e37',
          '#c71f37',
          '#b21e35',
          '#a11d33',
          '#6e1423',
          '#e01e37',
          '#c71f37',
          '#b21e35',
          '#a11d33',
        ],
        custom_font: { family: "'Cinzel'", link: 'Cinzel:wght@400;700' },
      },
      preview: 'https://media1.giphy.com/media/iamIahPLWmo4tGiyDz/200w.webp',
    },
    {
      color: 'pink',
      score: 4440,
      title: 'Coral by Yana',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffdbdb',
          'background-1': '#fecdcd',
          'background-2': '#fb7e85',
          borders: '#c84653',
          links: '#0b998f',
          sidebar: '#ea6666',
          'sidebar-text': '#ffe0e8',
          'text-0': '#952d2d',
          'text-1': '#703e3e',
          'text-2': '#703e3e',
        },
        custom_cards: [
          'https://images.unsplash.com/photo-1557672172-298e090bd0f1?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          'https://images.unsplash.com/photo-1561211974-8a2737b4dcac?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          'https://images.unsplash.com/photo-1576180606205-87261ca2f36c?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          'https://images.unsplash.com/photo-1610311911648-24d33745eb39?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          'https://images.unsplash.com/photo-1630182044456-b164bb97c367?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          'https://images.unsplash.com/photo-1562619371-b67725b6fde2?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          'https://images.unsplash.com/photo-1637499202942-1a9863fa65bd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          'https://images.unsplash.com/photo-1588097237448-45f7aadebae1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          'https://images.unsplash.com/photo-1564089957880-517edea1afc5?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          'https://images.unsplash.com/photo-1597773026935-df49538167e4?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
          'https://images.unsplash.com/photo-1556139902-7367723b7e9e?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        ],
        card_colors: [
          '#eaac8b',
          '#e56b6f',
          '#b56576',
          '#6d597a',
          '#355070',
          '#eaac8b',
        ],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://images.unsplash.com/photo-1610311911648-24d33745eb39?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    },
    {
      color: 'blue',
      score: 4430,
      title: 'Yankees by M Moore',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#211f2e',
          'background-1': '#211f2e',
          'background-2': '#211f2e',
          borders: '#ffffff',
          links: '#ffffff',
          sidebar:
            'linear-gradient(#0e0f2ac7, #000000c7), center url("https://i.pinimg.com/236x/5f/8e/e1/5f8ee1fda19cef62ea95dbec0cece88d.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/52/d1/42/52d142c87930f351cc26312f454fc25a.jpg',
          'https://i.pinimg.com/736x/6c/cc/a8/6ccca8aa0c1247617b21e9457fc1e1fa.jpg',
          'https://i.pinimg.com/564x/5f/8e/e1/5f8ee1fda19cef62ea95dbec0cece88d.jpg',
          'https://i.pinimg.com/236x/8e/f3/bb/8ef3bbbfcc08a0bfab3b92342e7bb0a1.jpg',
          'https://i.pinimg.com/564x/b8/a5/c5/b8a5c51cd00f7fb1ad33efaae2bbd2e8.jpg',
          'https://i.pinimg.com/236x/68/5a/80/685a80f833bc4a488c229543786378f4.jpg',
          'https://i.pinimg.com/originals/56/8e/6c/568e6c1b9f35ecb1a13597f5b4d4851f.jpg',
        ],
        card_colors: ['#ffffff'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://i.pinimg.com/originals/56/8e/6c/568e6c1b9f35ecb1a13597f5b4d4851f.jpg',
    },
    {
      color: 'lightblue',
      score: 4440,
      title: 'PastelBlue by Moony',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#cbd7e7',
          'background-1': '#a0baee',
          'background-2': '#4db6cb',
          borders: '#182377',
          links: '#708c99',
          sidebar:
            'linear-gradient(#ddeaf8c7, #ddeaf8c7), center url("https://i.pinimg.com/236x/3e/f6/8b/3ef68b573e3f6aa40bc3fca4859da95f.jpg")',
          'sidebar-text': '#0f3676',
          'text-0': '#352489',
          'text-1': '#2b60b1',
          'text-2': '#155575',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/7e/21/33/7e213370a1c5abb31b2d90215a12ce84.jpg',
          'https://i.pinimg.com/564x/4b/6d/73/4b6d73f60efd90df9ca823a2fa7fa9f8.jpg',
          'https://i.pinimg.com/564x/6c/ed/89/6ced8946daff30fb631ca2404a3119d2.jpg',
        ],
        card_colors: ['#636388', '#5f5f89', '#5b5b8b'],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/6c/ed/89/6ced8946daff30fb631ca2404a3119d2.jpg',
    },
    {
      color: 'purple',
      score: 4440,
      title: 'Scooby Doo by LadyFeline',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#d8d4f7',
          'background-1': '#f5f5f5',
          'background-2': '#d4d4d4',
          borders: '#c7cdd1',
          links: '#6a51e6',
          sidebar: 'linear-gradient(#6a51e6, #000000)',
          'sidebar-text': '#ffffff',
          'text-0': '#080808',
          'text-1': '#6a51e6',
          'text-2': '#1c1b1d',
        },
        custom_cards: [
          'https://64.media.tumblr.com/eaf5aa86362a134cc85383f45745fd55/tumblr_olyvvvACiE1r3ifxzo5_250.gifv',
          'https://64.media.tumblr.com/b31efed2f4600ff7a2215802c83ef2e8/tumblr_olyvvvACiE1r3ifxzo4_250.gifv',
          'https://64.media.tumblr.com/8a87e07881e6ad2cc20a39442a9e0e06/tumblr_olyvvvACiE1r3ifxzo2_250.gifv',
          'https://64.media.tumblr.com/6c0c29d5e123a85f3ad193ba0ee97cb6/tumblr_olyvvvACiE1r3ifxzo8_250.gifv',
          'https://64.media.tumblr.com/65c9973026f1d7cf61f91b223c1cee98/tumblr_olyvvvACiE1r3ifxzo6_250.gifv',
          'https://64.media.tumblr.com/21e7a861197821e228a3b0abac2a0fad/tumblr_olyvvvACiE1r3ifxzo7_250.gifv',
        ],
        card_colors: ['#a485f9'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://i.pinimg.com/564x/9c/bf/08/9cbf08dd9ab0cc2c2da84708d15e7f8d.jpg',
    },
    {
      color: 'beige',
      score: 3340,
      title: 'goodomens by chonny',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#EFDFC9',
          'background-1': '#1a2026',
          'background-2': '#212930',
          borders: '#2e3943',
          links: '#C57880',
          sidebar: '#152A19',
          'sidebar-text': '#f5f5f5',
          'text-0': '#C57725',
          'text-1': '#D3995B',
          'text-2': '#210F04',
        },
        custom_cards: [
          'https://64.media.tumblr.com/6fbf5d5800f7d76fe505f87366d00131/9c8abba0ec0f88eb-22/s540x810/ed5ce40f42835a1b3e7bc12ba0da80add1cd66b3.gifv',
          'https://64.media.tumblr.com/26efb618ac8f91ad4ef788e00bea3ff2/68cef8d8ce676fbf-3a/s1280x1920/d925acaee76cef6628c5200edee330ab1e3044cf.gif',
          'https://64.media.tumblr.com/01abf53fff6f380071d834e3d8f86d52/117108b9e6a32c34-bd/s540x810/2977a64d81421f9fb73fabb4bc0cb0a39e5c8090.gif',
          'https://64.media.tumblr.com/ca48a346f432d185de6118270254aed3/22aace47138f23f2-38/s540x810/2b52e545b58f86d702179696bc31a7ef6e39b027.gifv',
          'https://i0.wp.com/smartbitchestrashybooks.com/WP/wp-content/uploads/2020/02/giphyGoMa.gif?resize=480%2C270&ssl=1',
          'https://64.media.tumblr.com/8b33d8345853774a2d6c6dba14762a66/b0a5043adbe57d72-e1/s540x810/a76576363b0c8cd50d6c18dd84ae851fc0b975bf.gifv',
          'https://64.media.tumblr.com/02430191d69349a0f4d9598b7e1e8b9a/3fec76bc4c56b5f5-47/s540x810/d41edd60ccd61aa7016d897e67f40fb08a82546d.gifv',
        ],
        card_colors: [
          '#1e453e',
          '#306844',
          '#455b55',
          '#182c25',
          '#2c4c3b',
          '#1e453e',
          '#306844',
        ],
        custom_font: { family: "'Cinzel'", link: 'Cinzel:wght@400;700' },
      },
      preview:
        'https://i0.wp.com/smartbitchestrashybooks.com/WP/wp-content/uploads/2020/02/giphyGoMa.gif?resize=480%2C270&ssl=1',
    },
    {
      color: 'beige',
      score: 3440,
      title: 'Western by Frankie',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e9e8d8',
          'background-1': '#91b1ab',
          'background-2': '#885d59',
          borders: '#c39d97',
          links: '#0d0d0d',
          sidebar: '#815656',
          'sidebar-text': '#000000',
          'text-0': '#050505',
          'text-1': '#0a0a0a',
          'text-2': '#0d0c0c',
        },
        custom_cards: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRcQ_peGGbM7Hv-mBqougGObMff0qwG_zOXfA&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQS8AOYtnxW7oOnttzp5XYtCIfC-uiZj-djQg&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTKITT2FoioZMEKoEIBBFQASklXGXad9mvbGg&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSdXgOTGb7_66JhyAOavqve-ZreyrMoGfNRw&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQlTa9BUp8a6__5TfLJAX52wFW-ekA3BIg7NA&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRajJZwQIb21EdMRHXOQSSu7cq1GeP1Dygk-g&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-NLkv79UVald6nDbH-9cyJ-ivPQrd3xezrA&s',
        ],
        card_colors: [
          '#725b6a',
          '#816273',
          '#90697b',
          '#9f7084',
          '#ae778c',
          '#bd7f95',
          '#725b6a',
        ],
        custom_font: { family: "'Jost'", link: 'Jost:wght@400;700' },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSdXgOTGb7_66JhyAOavqve-ZreyrMoGfNRw&usqp=CAU',
    },
    {
      color: 'lightblue',
      score: 4440,
      title: 'Undersea by Robyn',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#d5e7eb',
          'background-1': '#89bbc8',
          'background-2': '#c4e1e9',
          borders: '#1a5766',
          links: '#003399',
          sidebar: '#0792',
          'sidebar-text': '#ffffff',
          'text-0': '#2c3f4e',
          'text-1': '#0c1418',
          'text-2': '#155c9e',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/0c/e0/95/0ce095b0c1aec17c89dc6b6f1cf34bae.jpg',
          'https://i.pinimg.com/originals/32/e8/5a/32e85ab924b40b45e00e7c96a544c744.jpg',
          'https://i.pinimg.com/originals/94/99/56/949956e451e29186b592afb4fd5dce7f.jpg',
          'https://i.pinimg.com/originals/bf/43/df/bf43df2edac5706abd79933a3a0292bb.jpg',
          'https://i.pinimg.com/originals/0e/40/dd/0e40dd70683b1ad4756e200cc24c0292.jpg',
          'https://i.pinimg.com/originals/61/52/6f/61526fac53218c6795aef7d93582f41c.jpg',
        ],
        card_colors: ['#0b9be3'],
        custom_font: { family: "'DM Sans'", link: 'DM+Sans:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/61/52/6f/61526fac53218c6795aef7d93582f41c.jpg',
    },
    {
      color: 'lightblue',
      score: 4430,
      title: '1989 by Rebecca',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#a6b6c3',
          'background-1': '#6181a7',
          'background-2': '#6181a7',
          borders: '#6181a7',
          links: '#e2e2e2',
          sidebar: '#6181a7',
          'sidebar-text': '#ffffff',
          'text-0': '#e2e2e2',
          'text-1': '#313b44',
          'text-2': '#E2E2E2',
        },
        custom_cards: [
          'https://pbs.twimg.com/media/F7VJmm8aQAAwQMH?format=jpg&name=4096x4096',
          'https://bwhsfalconflyer.com/wp-content/uploads/2023/10/40cd6498fde0eeb3e0a335a3c812031d.jpg',
        ],
        card_colors: ['#5b6873'],
        custom_font: {
          family: "'Architects Daughter'",
          link: 'Architects+Daughter:wght@400;700',
        },
      },
      preview:
        'https://bwhsfalconflyer.com/wp-content/uploads/2023/10/40cd6498fde0eeb3e0a335a3c812031d.jpg',
    },
    {
      color: 'white',
      score: 4440,
      title: 'Black&White by Jordan',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#ffffff',
          'background-2': '#ffffff',
          borders: '#000000',
          links: '#000000',
          sidebar: '#ffffff',
          'sidebar-text': '#cccccc',
          'text-0': '#000000',
          'text-1': '#000000',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/0d/60/ae/0d60ae44f48bbe448b16c5a6fc34b788.jpg',
          'https://img.freepik.com/free-photo/3d-rendering-abstract-black-white-background_23-2150913897.jpg',
          'https://wallpapercave.com/wp/wp12379806.png',
          'https://i.redd.it/9u6qefyqohq91.jpg',
          'https://wallpapers.com/images/hd/digital-art-metal-trash-can-b22rymbsn31h3xnx.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgmfHPsHK8XnOx1fBcpbr3EoWWfR6RnQJcLg&s',
          'https://i.pinimg.com/originals/4b/93/9b/4b939b300311de42b1d915694aeac8fe.jpg',
          'https://wallpapers.com/images/hd/liverpool-background-5jfz1vc2rxjjd6d2.jpg',
          'https://i.pinimg.com/originals/2e/47/2d/2e472d3b2754e9b44cde72cb45306acb.jpg',
        ],
        card_colors: ['#000000'],
        custom_font: { family: "'Arimo'", link: 'Arimo:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/0d/60/ae/0d60ae44f48bbe448b16c5a6fc34b788.jpg',
    },
    {
      color: 'black',
      score: 1320,
      title: 'brainrot by sienna',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#000000',
          borders: '#000000',
          links: '#c5c5c5',
          sidebar: '#000000',
          'sidebar-text': '#c5c5c5',
          'text-0': '#c5c5c5',
          'text-1': '#c5c5c5',
          'text-2': '#c5c5c5',
        },
        custom_cards: [
          'https://media.tenor.com/JchrWzlyjlcAAAAM/grimace-mcdonalds.gif',
          'https://media.tenor.com/CjfqlOScovQAAAAM/roblox-nugget-roblox-man-face.gif',
          'https://media.tenor.com/oNbPDIKSFNQAAAAM/fishstick-contract-giller.gif',
          'https://media.tenor.com/cPWuglL3WXoAAAAM/ulrik-dum-dum.gif',
          'https://media.tenor.com/GJZUmKh03dYAAAAM/emo.gif',
          'https://media.tenor.com/Ys5yEJi7r_MAAAAM/roblox-roblox-run.gif',
          'https://media1.tenor.com/m/iSYv29zEnxgAAAAC/oi-oi-oi-red-larva-meme.gif',
          'https://media.tenor.com/ukGvcbjfZqEAAAAM/skibidi-toilet-skibidi.gif',
        ],
        card_colors: [
          '#70d6ff',
          '#ff70a6',
          '#ff9770',
          '#ffd670',
          '#e9ff70',
          '#70d6ff',
          '#ff70a6',
          '#ff9770',
        ],
        custom_font: { family: "'Jost'", link: 'Jost:wght@400;700' },
      },
      preview: 'https://media.tenor.com/GJZUmKh03dYAAAAM/emo.gif',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'Pochacco by kil.h',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f0ebd8',
          'background-1': '#f1e3d3',
          'background-2': '#ea526f',
          borders: '#aeb8fe',
          sidebar:
            'linear-gradient(#64b6acc7, #119da4c7), center url("https://i.pinimg.com/564x/c9/5e/5c/c95e5c6a6b36ad61bc406f09229e0979.jpg")',
          'text-0': '#0b132b',
          'text-1': '#0b132b',
          'text-2': '#004e98',
          links: '#ff686b',
          'sidebar-text': '#ffffff',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/33/b6/6a/33b66af0e9fb3abc14bbf01b968d5bfd.gif',
          'https://i.pinimg.com/564x/12/fb/7e/12fb7e1141a34f3e9cea6821042fd191.jpg',
          'https://i.pinimg.com/474x/47/a8/ee/47a8ee7a0b2ef17e3b9263ae171a14e8.jpg',
          'https://i.pinimg.com/474x/54/03/ee/5403ee4b15edc228b3a91077462cb393.jpg',
          'https://i.pinimg.com/474x/e6/08/72/e6087210aa50f448acfbeb21a981259a.jpg',
          'https://i.pinimg.com/564x/ad/70/02/ad70024ef3ab0964f18c1374c3a1cd80.jpg',
          'https://i.pinimg.com/564x/b1/ae/26/b1ae26e83463c71cf64144612527a2d5.jpg',
          'https://i.pinimg.com/564x/8e/48/00/8e4800bb751583d9ed1cb47d3b90a916.jpg',
          'https://i.pinimg.com/564x/4e/29/0b/4e290b1a06ed1e3828d6e390c3ec90db.jpg',
          'https://i.pinimg.com/474x/e2/3b/b4/e23bb486eacc5728411ce90bdbcb89f1.jpg',
          'https://i.pinimg.com/474x/69/9a/56/699a5644516c4180505399bb7ad3c594.jpg',
          'https://i.pinimg.com/564x/46/58/79/46587905e05f2d87eb0ec01c589af4fe.jpg',
        ],
        card_colors: [
          '#f6bd60',
          '#cdb4db',
          '#e56b6f',
          '#adc178',
          '#90e0ef',
          '#ffb4a2',
        ],
        custom_font: { link: 'Barlow:wght@400;700', family: "'Barlow'" },
      },
      preview:
        'https://i.pinimg.com/474x/e2/3b/b4/e23bb486eacc5728411ce90bdbcb89f1.jpg',
    },
    {
      color: 'green',
      score: 4440,
      title: 'LOZ by Fikidu',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#193D34',
          'background-1': '#2A8ABC',
          'background-2': '#2A8ABC',
          borders: '#A3E1B8',
          links: '#62FCFF',
          sidebar: 'linear-gradient(#B4FCCA, #446F7B)',
          'sidebar-text': '#193D34',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://64.media.tumblr.com/320ec9ef52e2cd599d542f25a4a2d146/9f61bdc87f724f92-b5/s500x750/f56de20f6d818cbbefac196f29edeeddd91bdfde.gifv',
          'https://64.media.tumblr.com/8ee8adcac7d183b1e6d3af376b38295e/1f3726607f156237-12/s500x750/45ed21bd45f5bec0356cdca3d887528acf7f5339.gifv',
          'https://lh3.googleusercontent.com/pw/AP1GczPXEZb5gcr1SjvyyRH7MfjpZOKvriJ0EII6hUbbVewSu1Eo-MssnsuW__j7TkMRi-5AxlEz62qV6L1pXg4Mj3oWF9q0Je-psLsMQfpeGaTZOz7k6NqmvLEc_RtGDXS8TUJFLRsCc1MiOICBS4aEYIW74yO__PtjxwpejSyeXqwCzz5tzarKZSeVBQQf7slT07isdFAtG-yKOeRjD1R56-Sk8AL_aP-zAg7Us7Iv78Qa0v9HBOBdhNFYAPovsSkT580aG7r_gMsAjb9N4ReZ8g9X5rIpUdDwOA5-EF779SoJcRynEJPSQRp-u0nHdQt7Y7wZ56EV76m6MBxpDAVhZugNg0cFyiw6ZHNCIYb-Ew3qKHtvIX3-C5V8l6ztvhiwQF8DAzanH-a3ak8_qxWRDeuOsa2Tg_-nyl4zhIi_IstjjdemcIiGz1hdFpYjQXvuKb_dLVaT5T6v_UjULns9eMOUiIwlfQzL6oKyDq3iVxJ7OZTtquKw5wdptMT6nhx_8KiAhLMxqm9cG5V_56ppEu7f3KqF9vGzDGQZ-X8vEWnxKA2JD51mfjZxSEsfgzUTLaJG3Yz-pffA_enxHHfOvuMLuu8zBmyfr0ipEgK9QbAuZHjyKcwe9I4hEYiQfDQB5aimoIeB8lmK3mSD05NPLPYoSsrpNkjgHB4wVDxpVCIfj-fyTmAupAZRHoAebVyVKHAScZHB33A4kFbCElpA-ArkpwPO5QUW8tmsVjQJZlJbNJ_3QgP7iCMXhoswfca4TXWe0mSGzTf0XnNemu67SPPecG5Nmk1zsMInbGB4Ly6q3dFyJNmtmZhXQ_JpZTMxI_XjiqlaiUHZhzF0PjBga_szHtDcK9vUyQI3Zm30oa7THxbZFrdZjyAMU4-_682vrIDqTxBmRJpdWGTukR1Q3p0vOHs=w480-h270-s-no-gm?authuser=0',
          'https://64.media.tumblr.com/ca1b27b31ea647a42bc5d3a1cbdb21dc/7fbb8356579e9d68-b1/s540x810/3d16088b215d0fabc570788dac9527fd5f3ceb35.gifv',
          'https://64.media.tumblr.com/1f392a8c4e8b535c9155c39562b25a5f/7d5dfff0aafe8eeb-dd/s540x810/7ca541d16f082cf23154ae667e91442745ecb1f5.gifv',
          'https://64.media.tumblr.com/ec4c5f921adbde70d3cd2d3fa3f2707d/1f79e4f4d8668a99-c8/s540x810/d75f703ebb2282fd9aaece3b52abfa1156b48b31.gifv',
          'https://64.media.tumblr.com/321c17ec384ab8b7bce497e18e537bcf/1f3726607f156237-0c/s500x750/a9ec8efab9370c11195161cde8aae74a4c2503ca.gifv',
        ],
        card_colors: [
          '#acf7c9',
          '#a5f2c8',
          '#9eedc7',
          '#96e9c7',
          '#8fe4c6',
          '#88dfc5',
          '#81dbc5',
        ],
        custom_font: {
          family: "'Pixelify Sans'",
          link: 'Pixelify+Sans:wght@400;700',
        },
      },
      preview:
        'https://64.media.tumblr.com/320ec9ef52e2cd599d542f25a4a2d146/9f61bdc87f724f92-b5/s500x750/f56de20f6d818cbbefac196f29edeeddd91bdfde.gifv',
    },
    {
      color: 'white',
      score: 4330,
      title: 'LandoNorris by Kayleigh',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#ffddbd',
          'background-2': '#ff7300',
          borders: '#ff5e24',
          links: '#e06100',
          sidebar: '#ff7300',
          'sidebar-text': '#ffffff',
          'text-0': '#ff6600',
          'text-1': '#ff7300',
          'text-2': '#ff662e',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/d6/49/a8/d649a8ebb57f67096e1736ad53444193.jpg',
          'https://i.pinimg.com/474x/f4/71/16/f471168374ef46ffdbcc64fd2c16fe4c.jpg',
          'https://i.pinimg.com/474x/0b/cd/51/0bcd512f59066d487f35296f16be3b86.jpg',
          'https://i.pinimg.com/474x/2a/80/0b/2a800b395bd993c6343037386da2bfef.jpg',
          'https://i.pinimg.com/474x/7e/2f/d3/7e2fd3e6cd59e7ada9637867a27091c7.jpg',
          'https://i.pinimg.com/236x/1d/e1/4a/1de14ac1dac6031195ea564e8caa3c9a.jpg',
          'https://i.pinimg.com/736x/96/82/f1/9682f14b00eb6d38aa2da8bd8c29089e.jpg',
          'https://i.pinimg.com/474x/45/bf/76/45bf76c21e60bf75dae936e73d621d5d.jpg',
          'https://i.pinimg.com/474x/43/58/55/4358559d5fa38115b3982e0d3cac0a7e.jpg',
          'https://i.pinimg.com/474x/ee/83/7f/ee837fccec857821b5c89ffd751b40a5.jpg',
          'https://i.pinimg.com/474x/c2/cf/c5/c2cfc5b465ab94bfe67c2650ebf25924.jpg',
          'https://i.pinimg.com/236x/e2/c2/d8/e2c2d8d0b96808f3b1ef7194f2ecf1a7.jpg',
          'https://i.pinimg.com/474x/60/66/86/606686cc7cdc7e4d8dfccc6f8414bcb6.jpg',
          'https://i.pinimg.com/474x/a5/d4/9d/a5d49d27eaf6eeb541760376cab29958.jpg',
          'https://i.pinimg.com/474x/f4/90/8c/f4908c48fb83a050c8e3799c70fa503a.jpg',
          'https://i.pinimg.com/474x/31/04/4e/31044ef30cef36cddfc9758468ef5971.jpg',
          'https://i.pinimg.com/474x/99/8b/15/998b1589e30e9708749da2948f99c89c.jpg',
          'https://i.pinimg.com/736x/9c/ee/af/9ceeaf60b09cc93a7a9010755f4f243a.jpg',
          'https://i.pinimg.com/474x/de/4e/58/de4e58abab89adda516bae849726ef50.jpg',
          'https://i.pinimg.com/474x/02/d3/2a/02d32a41ee9af3b79a2288b3e3ae1462.jpg',
          'https://i.pinimg.com/236x/dd/04/ba/dd04baf39f849d78ae972dd06bef1cdb.jpg',
        ],
        card_colors: ['#b85300'],
        custom_font: {
          family: "'Happy Monkey'",
          link: 'Happy+Monkey:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/474x/02/d3/2a/02d32a41ee9af3b79a2288b3e3ae1462.jpg',
    },
    {
      color: 'brown',
      score: 4340,
      title: 'ArabianNights by Lexi',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#6d5d46',
          'background-1': '#776d50',
          'background-2': '#44381d',
          borders: '#483514',
          links: '#483514',
          sidebar: '#6d5d46',
          'sidebar-text': '#a39180',
          'text-0': '#483514',
          'text-1': '#483514',
          'text-2': '#483514',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/be/e0/3e/bee03e9fbcafaa9bbf739df3fbebc6dd.jpg',
          'https://i.pinimg.com/736x/a1/c5/7e/a1c57e6fd4f76a02c11ac2cc17e89ab4.jpg',
          'https://i.pinimg.com/564x/ef/34/6c/ef346c092aa2df463293359ebdcdb181.jpg',
          'https://i.pinimg.com/564x/d4/11/82/d411826418729c80f6c63bf5e0ee9dd8.jpg',
          'https://i.pinimg.com/564x/52/1a/6e/521a6eecb07338c46aa598d6a47be262.jpg',
          'https://i.pinimg.com/564x/f3/f6/25/f3f6256abf46333945d8ce56d553240b.jpg',
          'https://i.pinimg.com/564x/37/5c/11/375c11e468d51583b6927a9bfcfebb4c.jpg',
          'https://i.pinimg.com/736x/7d/de/21/7dde216e20efa643f1e4f2dc9adc6776.jpg',
          'https://i.pinimg.com/736x/10/c9/11/10c911ff2e98c63b45e06f006ee1e453.jpg',
          'https://i.pinimg.com/564x/19/1f/d2/191fd25251f4162eccfe36e883562f99.jpg',
        ],
        card_colors: ['#533b13'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://i.pinimg.com/564x/d4/11/82/d411826418729c80f6c63bf5e0ee9dd8.jpg',
    },
    {
      color: 'lightgreen',
      score: 4441,
      title: 'AnimalCrossing by Emily',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e4fbea',
          'background-1': '#88c9a1',
          'background-2': '#82cac6',
          borders: '#7cc9c3',
          links: '#40816b',
          sidebar: 'linear-gradient(#88c9a1, #83c8d8)',
          'sidebar-text': '#473e2e',
          'text-0': '#473e2e',
          'text-1': '#005751',
          'text-2': '#2d6895',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/3d/79/1d/3d791dd672496c32099e888076b41bba.jpg',
          'https://i.pinimg.com/564x/05/22/11/0522110dd4e5bdee6abf88d49803b1c8.jpg',
          'https://i.pinimg.com/564x/6c/af/c4/6cafc49f70b76b042984a08281503769.jpg',
          'https://i.pinimg.com/564x/15/f9/d8/15f9d8b992d84fdb8493c492043efd1d.jpg',
          'https://i.pinimg.com/564x/94/03/b5/9403b541c43d0a4525559cb5dcf56f8b.jpg',
          'https://i.pinimg.com/564x/03/f0/23/03f023777df5606c92b08978f1bb9f05.jpg',
        ],
        card_colors: [
          '#005751',
          '#009688',
          '#d99309',
          '#1770ab',
          '#0b9be3',
          '#5c2b0f',
        ],
        custom_font: { family: "'ABeeZee'", link: 'ABeeZee:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/94/03/b5/9403b541c43d0a4525559cb5dcf56f8b.jpg',
    },
    {
      color: 'black',
      score: 4440,
      title: 'Manga by Pog_dogYT',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#121212',
          'background-2': '#ffffff',
          borders: '#707070',
          links: '#bfbfbf',
          sidebar:
            'linear-gradient(#5c5c5cc7, #000000c7), center url("https://i.pinimg.com/736x/46/ec/52/46ec52beac255849ce49b03f90ba54a7.jpg")',
          'sidebar-text': '#c5c5c5',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#cfcfcf',
        },
        custom_cards: [
          'https://pbs.twimg.com/media/EzmZHYfWUAA51dM?format=png&name=large',
          'https://mangaforum.art.blog/wp-content/uploads/2017/06/assassination-classroom-manga-banner-1.jpg',
          'https://i.pinimg.com/originals/63/2e/7d/632e7d0542be658780decf1631baf5dd.jpg',
          'https://de7i3bh7bgh0d.cloudfront.net/2021/08/10/23/37/12/07106852-596e-4d69-9eef-3914158ca07e/MashCh58pg15.jpg',
          'https://preview.redd.it/sukunas-malevolent-shrine-manga-vs-anime-jjk-animators-v0-tc35h5byws0c1.png?width=1728&format=png&auto=webp&s=d1c2d2d15d1f50a71f896aa01963fe97af1c7c80',
          'https://preview.redd.it/jnbbzk03h9h71.jpg?auto=webp&s=186e0c342ec373f9151d8a94339d23d6ecbde154',
          'https://pbs.twimg.com/media/E2epmf8WYAQUJuP.jpg',
          'https://i.redd.it/tg5dus4u7qe91.png',
          'https://static1.cbrimages.com/wordpress/wp-content/uploads/2023/06/collage-maker-20-jun-2023-03-10-pm-6176.jpg',
          'https://preview.redd.it/suiy47wntko81.jpg?width=640&crop=smart&auto=webp&s=5624695b68c3f4d5d12ce790f395e7db4a2dd91c',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRYq8UZhn6dlPWMjqwv_QilYdkCNboIdEufw&s',
          'https://i1.wp.com/multiversitystatic.s3.amazonaws.com/uploads/2015/10/Saitama-Backstory.jpg?fit=773%2C768',
          'https://static.wikia.nocookie.net/5866e157-fbf0-472e-af9d-c66798838039/scale-to-width/370',
          'https://static1.cbrimages.com/wordpress/wp-content/uploads/2023/05/dragon-ball-manga-vegeta-sacrifice-against-buu.jpg',
          'https://elestoque.org/wp-content/uploads/2021/04/021-900x675.jpg',
        ],
        card_colors: [
          '#3f3f3f',
          '#5f5f5f',
          '#7f7f7f',
          '#9f9f9f',
          '#bfbfbf',
          '#e0e0e0',
          '#3f3f3f',
          '#5f5f5f',
          '#7f7f7f',
          '#9f9f9f',
          '#bfbfbf',
          '#e0e0e0',
          '#3f3f3f',
          '#5f5f5f',
          '#7f7f7f',
        ],
        custom_font: { family: "'Oswald'", link: 'Oswald:wght@400;700' },
      },
      preview:
        'https://de7i3bh7bgh0d.cloudfront.net/2021/08/10/23/37/12/07106852-596e-4d69-9eef-3914158ca07e/MashCh58pg15.jpg',
    },
    {
      color: 'white',
      score: 4240,
      title: 'NatureDroplets by Shreya',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '',
          'background-1': '#E8E5AB',
          'background-2': '#9D3686',
          borders: '#722F37',
          links: '',
          sidebar:
            'linear-gradient(#BC6FA1c7, #FFF3DFc7), center url("https://i.ebayimg.com/images/g/exQAAOSwGx5lEpq4/s-l1200.jpg")',
          'sidebar-text': '#FFFFFF',
          'text-0': '#000000',
          'text-1': '',
          'text-2': '#4682B4',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/15/a0/7a/15a07aed7006bfe3b19448fb93fb2eca.jpg',
          'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExajVudXA3bDJ1eHlka3YxNjczcWxoMnZnZHZ5eWdsdGxrNDR5NHlhMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/esZsaISgTfXHO/200.webp',
          'https://media1.giphy.com/media/qhepNcb0L83PG/200w.webp',
          'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDdpOGQ4bG4zZWZjZGFpbjlqN2I2d2I0YjBvNTV6NGt5cTN2NHFlNCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/nCDwnpdVzJr0I/200.webp',
          'https://media1.giphy.com/media/bXX4fJKMstL1K/200w.webp',
          'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExajJ0cDJrcXQ3ZzQ2dWpwYmQ5YnNjenZpbnBtMWRqY2xuam9iZWkxYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/NaOkywX1jdzoY/giphy.webp',
          'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExc3hoYXNzMmRraGM5dDAwdGVvdXR0MnJyMXBubG53bG10a3h2bGd1OCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/RUeFAanDM2Mik/giphy.webp',
        ],
        card_colors: [
          '#8a9a5b',
          '#e0bfb8',
          '#6495ed',
          '#c3b1e1',
          '#915f6d',
          '#6082b6',
        ],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExajVudXA3bDJ1eHlka3YxNjczcWxoMnZnZHZ5eWdsdGxrNDR5NHlhMCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/esZsaISgTfXHO/200.webp',
    },
    {
      color: 'lightblue',
      score: 4440,
      title: 'LEBLU by robyn',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fff9f0',
          'background-1': '#f9f5e3',
          'background-2': '#7fcaf0',
          borders: '#9ccbe8',
          links: '#5fb3dd',
          sidebar: '#7fbff0',
          'sidebar-text': '#ffffff',
          'text-0': '#1d1e1',
          'text-1': '#40b3ed',
          'text-2': '#009dff',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/7d/a4/ba/7da4ba5346ec8b4628854067e991973f.jpg',
          'https://i.pinimg.com/474x/6c/5a/12/6c5a12c2d13a213b1ded56cc0b1d34ad.jpg',
          'https://i.pinimg.com/474x/b7/20/40/b7204099fdc09fa61c8dff571274589b.jpg',
          'https://i.pinimg.com/474x/a8/31/37/a83137ad419e6ae1a760454aaf247634.jpg',
          'https://i.pinimg.com/564x/5a/19/60/5a1960122ce547a590c336db39978539.jpg',
          'https://i.pinimg.com/736x/99/8a/96/998a96ecdc3720bf23b685eeb0c2022b.jpg',
          'https://i.pinimg.com/564x/90/e6/c7/90e6c7bd2f7e4535910c12b42eb70301.jpg',
        ],
        card_colors: ['#0b9be3'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://i.pinimg.com/474x/7d/a4/ba/7da4ba5346ec8b4628854067e991973f.jpg',
    },
    {
      color: 'brown',
      score: 4230,
      title: 'Eveee by Makenzie',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#AB8348',
          'background-1': '#AC8C4C',
          'background-2': '#E4C587',
          borders: '#D171B4',
          links: '#610345',
          sidebar: '#5C3F0D',
          'sidebar-text': '#E4C587',
          'text-0': '#F7EDD4',
          'text-1': '#DFD5B9',
          'text-2': '#D0C3A2',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/cf/90/ab/cf90ab837430b0967642408646047f7f.gif',
          'https://i.pinimg.com/originals/ff/30/2d/ff302deaf6e2d3f64dff3b7309277bd0.gif',
          'https://i.pinimg.com/originals/fc/2b/6d/fc2b6da90f64a5845415b5b280c47e9c.gif',
        ],
        card_colors: ['#610345', '#b5bc9a', '#1a408b'],
        custom_font: {
          family: "'Happy Monkey'",
          link: 'Happy+Monkey:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/originals/ff/30/2d/ff302deaf6e2d3f64dff3b7309277bd0.gif',
    },
    {
      color: 'brown',
      score: 4430,
      title: 'TropicalBoho by olive',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#24190a',
          'background-1': '#332b0a',
          'background-2': '#886925',
          borders: '#7a481a',
          links: '#706b29',
          sidebar: 'linear-gradient(#7c2c09, #3e3e19)',
          'sidebar-text': '#c4b382',
          'text-0': '#784b0d',
          'text-1': '#b18d4e',
          'text-2': '#4e3f32',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/b3/40/56/b34056893be731dafe254ee15a71648b.jpg',
        ],
        card_colors: ['#a1511b'],
        custom_font: {
          family: "'Pixelify Sans'",
          link: 'Pixelify+Sans:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/736x/b3/40/56/b34056893be731dafe254ee15a71648b.jpg',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'cozysnoopy by yminah',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f5f1d6',
          'background-1': '#a28f71',
          'background-2': '#957b56',
          borders: '#283618',
          links: '#765937',
          sidebar: '#514027',
          'sidebar-text': '#ffffff',
          'text-0': '#273517',
          'text-1': '#283618',
          'text-2': '#3d3d3d',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/26/d4/9e/26d49ebd6e3ee6ce78ad1dead6b4ac27.jpg',
          'https://i.pinimg.com/originals/eb/91/f3/eb91f3a3250d6deb05f796ac2f2d1abf.jpg',
          'https://i.pinimg.com/originals/72/b0/d9/72b0d9f6b318ebc21dfbec60d1690c15.gif',
          'https://i.pinimg.com/originals/fb/03/8c/fb038c9d39ed13ab401512e9f87d6fa1.gif',
        ],
        card_colors: ['#b41223', '#874555', '#466137', '#0b2443'],
        custom_font: { family: "'Jost'", link: 'Jost:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/eb/91/f3/eb91f3a3250d6deb05f796ac2f2d1abf.jpg',
    },
    {
      color: 'beige',
      score: 3430,
      title: 'Spiderman by Tegann',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#d7d0bc',
          'background-1': '#d7d0bc',
          'background-2': '#ad1a27',
          borders: '#4d57a3',
          links: '#ad1a27',
          sidebar: '#ad1a27',
          'sidebar-text': '#d7d0bc',
          'text-0': '#ad1a27',
          'text-1': '#ad1a27',
          'text-2': '#3b4abf',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/94/36/29/943629f12c95d28c13b13475cc3a4e8c.jpg',
          'https://i.pinimg.com/474x/0f/7b/f2/0f7bf2552d24c88c24a159946915b276.jpg',
        ],
        card_colors: ['#3b4abf'],
        custom_font: {
          family: "'Permanent Marker'",
          link: 'Permanent+Marker:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/474x/94/36/29/943629f12c95d28c13b13475cc3a4e8c.jpg',
    },
    {
      color: 'white',
      score: 4330,
      title: 'springflowers by iliana',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#fafafa',
          'background-2': '#c2a2e2',
          borders: '#314729',
          links: '#9e88aa',
          sidebar: '#a191b1',
          'sidebar-text': '#ffffff',
          'text-0': '#a8c2aa',
          'text-1': '#e69393',
          'text-2': '#5c526b',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/b4/8b/0f/b48b0f804da93e6326bd06ac89b430f1.jpg',
          'https://i.pinimg.com/474x/12/f6/65/12f66531993071bc5ba4ac7152971a18.jpg',
          'https://i.pinimg.com/474x/d1/2d/98/d12d98a97b37a48f90bcd75f87307cfc.jpg',
        ],
        card_colors: ['#f6bd60', '#f28482', '#f5cac3'],
        custom_font: {
          family: "'Permanent Marker'",
          link: 'Permanent+Marker:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/474x/12/f6/65/12f66531993071bc5ba4ac7152971a18.jpg',
    },
    {
      color: 'white',
      score: 2340,
      title: 'AttackonTitan by ash',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#ffe0ed',
          'background-2': '#ffe5ee',
          borders: '#f490b3',
          links: '#f490b3',
          sidebar:
            'linear-gradient(#d373a2c7, #4c0b3bc7), center url("https://c4.wallpaperflare.com/wallpaper/458/1015/608/attack-on-titan-eren-jaeger-shingeki-no-kyojin-wallpaper-preview.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#f490b3',
          'text-1': '#ff8f8f',
          'text-2': '#ff5c5c',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/10/20/3c/10203c11cfe3bf1faa61a93b7e71e2f4.gif',
          'https://pa1.aminoapps.com/6364/0f33c67da60d940faef8d196af0271af56becc0c_hq.gif',
          'https://i.pinimg.com/originals/8c/a9/70/8ca97076acda16c6f114a7f552561907.gif',
          'https://media2.giphy.com/media/xUPGcC4A6ElcqtUJck/giphy.gif?cid=6c09b95214oxk392pr2u96rucrt9j2t237ymynuhhzz5o19m&ep=v1_internal_gif_by_id&rid=giphy.gif&ct=g',
          'https://i.pinimg.com/originals/d3/5f/24/d35f2448e44521fc6afc1f36eb790f50.gif',
          'https://i.gifer.com/852T.gif',
          'https://24.media.tumblr.com/e62e2395fa772867d83690f66a89fab4/tumblr_mxu0zacTvL1s80y4no1_500.gif',
          'https://qph.cf2.quoracdn.net/main-qimg-631654836dd4151e067b7df410d06db8',
        ],
        card_colors: [
          '#ff0000',
          '#ff5200',
          '#efea5a',
          '#3cf525',
          '#147df5',
          '#be0aff',
        ],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://pa1.aminoapps.com/6364/0f33c67da60d940faef8d196af0271af56becc0c_hq.gif',
    },
    {
      color: 'white',
      score: 3320,
      title: 'CHB by Ann',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fcfcfc',
          'background-1': '#f18509',
          'background-2': '#f18509',
          borders: '#f18509',
          links: '#56Caf0',
          sidebar: '#f18509',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f18509',
          'text-1': '#784812',
          'text-2': '#ff9f1a',
        },
        custom_cards: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMtB_Chy6JhLhKZG2XJTzGMZWhMrWymwjoHw&s',
        ],
        card_colors: ['#f2850a'],
        custom_font: {
          family: "'Happy Monkey'",
          link: 'Happy+Monkey:wght@400;700',
        },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMtB_Chy6JhLhKZG2XJTzGMZWhMrWymwjoHw&s',
    },
    {
      color: 'white',
      score: 4430,
      title: 'Leclerc by Kayleigh',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#fffafa',
          'background-2': '#ffffff',
          borders: '#a30000',
          links: '#a30000',
          sidebar: '#ffffff',
          'sidebar-text': '#e60000',
          'text-0': '#bd0000',
          'text-1': '#c20000',
          'text-2': '#a80000',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/d8/c6/8f/d8c68f6ee67256cb7c46f96a33883aab.jpg',
          'https://i.pinimg.com/236x/2d/85/e2/2d85e266a25fecdd2b5e10f0c96f7421.jpg',
          'https://i.pinimg.com/736x/2d/90/69/2d906970b97b1d6c94d47684107b1751.jpg',
          'https://i.pinimg.com/736x/7c/5a/28/7c5a28afb3acabe3020da0724b949369.jpg',
          'https://i.pinimg.com/474x/01/85/3e/01853e96a0aee5316d08f17153b150c0.jpg',
          'https://i.pinimg.com/474x/ff/1b/2f/ff1b2f3094c84981613572c77a257c5f.jpg',
          'https://i.pinimg.com/236x/6f/2f/96/6f2f9633aca5477ea306cb9373f65c8a.jpg',
          'https://i.pinimg.com/236x/dd/bf/93/ddbf933fba66984d5e4248652e69274b.jpg',
          'https://i.pinimg.com/236x/7d/f1/59/7df159326b295cde1782fdc0ad29cbc2.jpg',
          'https://i.pinimg.com/236x/4e/70/98/4e7098f66610408430a1bf286c11ca97.jpg',
          'https://i.pinimg.com/236x/a8/09/63/a809638bc7da39d75ff8f585ef80a741.jpg',
          'https://i.pinimg.com/736x/ef/7c/63/ef7c63a881ec9b48ad243863f7acf6e0.jpg',
          'https://i.pinimg.com/736x/58/61/7c/58617c8d4eb208cf98ecc3ed415e87ab.jpg',
          'https://i.pinimg.com/236x/aa/d4/a3/aad4a3f2919d4fb97cfcec9780981e7a.jpg',
          'https://i.pinimg.com/564x/f6/88/1c/f6881c7c3cdc357ecfcf58f8bfb5c75c.jpg',
          'https://i.pinimg.com/236x/a6/f8/9e/a6f89e4ab75df93454bb68e39f29bec5.jpg',
          'https://i.pinimg.com/236x/2a/71/f9/2a71f9d785aecfc40203e69cc0309767.jpg',
          'https://i.pinimg.com/736x/6e/9e/66/6e9e66905ceaf91b01e14fc57c6ec643.jpg',
          'https://i.pinimg.com/736x/0e/98/75/0e98752cbf7b1594b1a30326e8911b3f.jpg',
          'https://i.pinimg.com/736x/0c/65/dd/0c65dde4494abfd4f477569855d1085e.jpg',
          'https://i.pinimg.com/236x/3c/7e/5f/3c7e5fb2c2605b34ab795a825c97e8de.jpg',
        ],
        card_colors: ['#d60000'],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/236x/4e/70/98/4e7098f66610408430a1bf286c11ca97.jpg',
    },
    {
      color: 'blue',
      score: 2220,
      title: 'GreysAnatomy  by Emberli',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#4a71fc',
          'background-1': '#080821',
          'background-2': '#080821',
          borders: '#f7f7f8',
          links: '#121131',
          sidebar: '#080821',
          'sidebar-text': '#fcfcfd',
          'text-0': '#fcfcfc',
          'text-1': '#ffffff',
          'text-2': '#fafafa',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/98/4b/ea/984beac6a1c618358560e08d237c10ff.jpg',
          'https://i.pinimg.com/564x/5e/92/f7/5e92f7aaf90b3283725b5ea64bf229a4.jpg',
          'https://i.pinimg.com/564x/fd/60/e2/fd60e2c0e20c854d3a23d53674cd2792.jpg',
          'https://i.pinimg.com/564x/0d/67/b6/0d67b612c91d3b2a1655827fb2c34e85.jpg',
          'https://i.pinimg.com/564x/5c/cd/5b/5ccd5b37d890a333f76d9622855249c7.jpg',
          'https://i.pinimg.com/564x/66/23/14/662314b9e24dd7f024c00f5dbae61d12.jpg',
          'https://i.pinimg.com/564x/d9/87/76/d987760a478c0112d4110cdc904d2345.jpg',
          'https://i.pinimg.com/736x/73/92/73/7392738c606475fb3801006e96913427.jpg',
        ],
        card_colors: ['#8f0083'],
        custom_font: { family: "'Caveat'", link: 'Caveat:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/66/23/14/662314b9e24dd7f024c00f5dbae61d12.jpg',
    },
    {
      color: 'beige',
      score: 4340,
      title: 'beigestudy by nowshin',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fff8f0',
          'background-1': '#e8ccb5',
          'background-2': '#fee1e1',
          borders: '#b48e7e',
          links: '#ffcccc',
          sidebar: '#f0d6d6',
          'sidebar-text': '#704c2e',
          'text-0': '#472610',
          'text-1': '#481d0f',
          'text-2': '#ffcccc',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/87/fc/8c/87fc8ca9428caff232f37bd9ef547aad.jpg',
          'https://i.pinimg.com/originals/14/f6/57/14f657847d5085bb944ce9df6e25f7c3.jpg',
          'https://i.pinimg.com/originals/dd/07/87/dd078735318110132bc02e22be16c4b7.jpg',
          'https://i.pinimg.com/736x/82/0d/7e/820d7edf5c4ae7d29e54772eee33c92d.jpg',
          'https://i.pinimg.com/originals/ce/67/aa/ce67aaa41da4c60eca91e30547499267.jpg',
          'https://i.pinimg.com/564x/5a/23/53/5a2353d4d88067869c5aa6a6cc7c2882.jpg',
          'https://i.pinimg.com/564x/7a/98/13/7a9813601d213722fcdb2c4d41dfed85.jpg',
          'https://i.pinimg.com/564x/07/47/52/074752696090540ff352a4c1196b6107.jpg',
          'https://i.pinimg.com/564x/9f/90/be/9f90be69e82f94a776bb58033fc7ed57.jpg',
        ],
        card_colors: ['#d9b99b'],
        custom_font: { family: "'Comfortaa'", link: 'Comfortaa:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/5a/23/53/5a2353d4d88067869c5aa6a6cc7c2882.jpg',
    },
    {
      color: 'pink',
      score: 4440,
      title: 'BerryStickO by EcstasyCheese',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#feecf0',
          'background-1': '#ffffff',
          'background-2': '#ca1c47',
          borders: '#e56182',
          links: '#ca1c47',
          sidebar: 'linear-gradient(#e56182, #f4c0cd)',
          'sidebar-text': '#ffffff',
          'text-0': '#ca1c47',
          'text-1': '#e56182',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://preview.redd.it/strawberry-sticko-v1-pics-for-bettercanvas-v0-94b9j5sn92hd1.png?width=528&format=png&auto=webp&s=bcb9064929f077dac8ab9755b8854d0cb6170847',
          'https://preview.redd.it/strawberry-sticko-v1-pics-for-bettercanvas-v0-svbdb5sn92hd1.png?width=528&format=png&auto=webp&s=4ff3ca5aceae9fe2937550ea4de69d03fbbd32a8',
          'https://preview.redd.it/strawberry-sticko-v1-pics-for-bettercanvas-v0-ro8no9sn92hd1.png?width=528&format=png&auto=webp&s=222f2855a7508be4642fb3e0fd10d96dc942e7e2',
          'https://preview.redd.it/strawberry-sticko-v1-pics-for-bettercanvas-v0-wrwoh6sn92hd1.png?width=528&format=png&auto=webp&s=e331b7ac992f14b49782b512452393546ee2164a',
          'https://preview.redd.it/strawberry-sticko-v1-pics-for-bettercanvas-v0-cacj2asn92hd1.png?width=528&format=png&auto=webp&s=a11d3f39c94cafb6e956b58220419c6da4448416',
          'https://preview.redd.it/strawberry-sticko-v1-pics-for-bettercanvas-v0-dzmi19sn92hd1.png?width=528&format=png&auto=webp&s=f59d7aa5aaacc6e4d184e7dd014e8eded1cfde9f',
          'https://preview.redd.it/strawberry-sticko-v1-pics-for-bettercanvas-v0-l6yyr7sn92hd1.png?width=528&format=png&auto=webp&s=7fd269561ef552feab8df80c1ddc830c3330e28a',
          'https://preview.redd.it/strawberry-sticko-v1-pics-for-bettercanvas-v0-on4fi3sn92hd1.png?width=528&format=png&auto=webp&s=da34348328014ef38a1caca5f8b8f141c4508e3f',
        ],
        card_colors: ['#ca1c47'],
        custom_font: {
          family: "'gochi hand'",
          link: 'Gochi+Hand:wght@400;700',
        },
      },
      preview:
        'https://preview.redd.it/strawberry-sticko-v1-pics-for-bettercanvas-v0-svbdb5sn92hd1.png?width=528&format=png&auto=webp&s=4ff3ca5aceae9fe2937550ea4de69d03fbbd32a8',
    },
    //{ "title": "Stray kids by Saishee", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#0f0f0f", "background-1": "#0c0c0c", "background-2": "#211c1c", "borders": "#1e1e1e", "links": "#c6d7d1", "sidebar": "#0c0c0c", "sidebar-text": "#f5f5f5", "text-0": "#edc4c4", "text-1": "#e2e2e2", "text-2": "#5b5757" }, "custom_cards": ["https://i.pinimg.com/474x/6a/a4/32/6aa4326db14cfc001f926442bec125d5.jpg", "https://i.pinimg.com/474x/b3/7a/9c/b37a9c6857416ccf33bec2c68bcc94b5.jpg", "https://i.pinimg.com/564x/76/a3/fb/76a3fb5cc7caddfa3239fc5a32cb1dee.jpg", "https://i.pinimg.com/474x/0a/e3/23/0ae323e8bd7934d8441816499d8e7359.jpg", "https://i.pinimg.com/474x/69/28/c8/6928c8c7bf0cadbd4369d14f46b6c2d8.jpg", "https://i.pinimg.com/474x/4d/57/a9/4d57a99053f87872a7f53d6cdf1f65de.jpg", "https://i.pinimg.com/474x/e4/52/5a/e4525a3aceb0656b6124f7f1e5d477d6.jpg", "https://i.pinimg.com/474x/dc/00/41/dc0041b2a2bc234837a38aef21f3ccd2.jpg", "https://i.pinimg.com/474x/69/c7/7e/69c77ef8a3e9017f4a956535b0e6eb4f.jpg"], "card_colors": ["#c6d7d1"], "custom_font": { "family": "'Playfair Display'", "link": "Playfair+Display:wght@400;700" } }, "preview": "https://i.pinimg.com/474x/69/c7/7e/69c77ef8a3e9017f4a956535b0e6eb4f.jpg" },
    {
      color: 'beige',
      score: 3330,
      title: 'Fantasy by Miranda',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#E1D8C4',
          'background-1': '#',
          'background-2': '#',
          borders: '#3d251e',
          links: '#d28584',
          sidebar:
            'linear-gradient(#d28584c7, #000000c7), center url("https://i.pinimg.com/564x/32/03/2f/32032f56d1513a97a5804c09739545f9.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#3d251e',
          'text-1': '#3d251e',
          'text-2': '#3d251e',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/2b/22/c6/2b22c64160677cb97fa36e8012f07ddc.jpg',
          'https://i.pinimg.com/736x/48/ef/ed/48efedc6e53fb27170b52a76b73b7204.jpg',
          'https://i.pinimg.com/564x/85/4d/7b/854d7bd85ae1bef392c80c7e3f01a419.jpg',
          'https://i.pinimg.com/564x/59/e3/a7/59e3a7e93e7354878238857f3c070f6e.jpg',
          'https://i.pinimg.com/564x/32/03/2f/32032f56d1513a97a5804c09739545f9.jpg',
          'https://i.pinimg.com/564x/60/37/d8/6037d838a415a126ac091ca733646bca.jpg',
          'https://i.pinimg.com/736x/87/e4/ec/87e4ecc23258fac19b6b00bdcef73939.jpg',
          'https://i.pinimg.com/564x/39/3e/0e/393e0eacc03642dd8fa663f230f5164b.jpg',
          'https://i.pinimg.com/564x/0c/79/c9/0c79c9d5ea846b1e79fe2db31f76d82e.jpg',
          'https://i.pinimg.com/564x/ff/b0/17/ffb017b914b5acd29afc18251dab18dd.jpg',
          'https://i.pinimg.com/564x/d5/38/54/d53854ba4b45d6e8ab7862319a03bdf5.jpg',
        ],
        card_colors: ['#3d251e'],
        custom_font: {
          family: "'Nanum Myeongjo'",
          link: 'Nanum+Myeongjo:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/39/3e/0e/393e0eacc03642dd8fa663f230f5164b.jpg',
    },
    {
      color: 'red',
      score: 4430,
      title: 'cherry by elizabeth',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#963131',
          'background-1': '#5a2626',
          'background-2': '',
          borders: '',
          links: '',
          sidebar: '#5a2626',
          'sidebar-text': '#eddbc2',
          'text-0': '#eddbc2',
          'text-1': '#eddbc2',
          'text-2': '#eddbc2',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/b5/11/75/b51175545c2af654df242afa0d514025.jpg',
          'https://i.pinimg.com/736x/f9/6a/6a/f96a6a6302269e92a9d345ce4c54646b.jpg',
          'https://i.pinimg.com/564x/ac/41/e9/ac41e9ec5ff2d9d95ede13ba33b77235.jpg',
          'https://i.pinimg.com/736x/6b/7c/1b/6b7c1b108902be1deb72e31c7c7020e4.jpg',
          'https://i.pinimg.com/736x/79/88/f4/7988f47d7903bd6aa4d8f366cdddeaf8.jpg',
          'https://i.pinimg.com/564x/97/2d/f7/972df785c3f9f1e0d9b93615d2520328.jpg',
          'https://i.pinimg.com/736x/36/b0/0b/36b00bf63da23229daab0a82be9bd7fe.jpg',
        ],
        card_colors: [
          '#bb3b38',
          '#008400',
          '#5a2626',
          '#5a2626',
          '#5a2626',
          '#5a2626',
          '#5a2626',
          '#bb3b38',
        ],
        custom_font: { family: "'Rubik'", link: 'Rubik:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/b5/11/75/b51175545c2af654df242afa0d514025.jpg',
    },
    {
      color: 'blue',
      score: 4430,
      title: 'blueflower by Rosey',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#154360',
          'background-1': '#2874A6',
          'background-2': '#3498DB',
          borders: '#85C1E9',
          links: '#AED6F1',
          sidebar:
            'linear-gradient(#000000c7, #2874A6c7), center url("https://i.etsystatic.com/16700126/r/il/545b20/4708047920/il_570xN.4708047920_qf65.jpg")',
          'sidebar-text': '#AED6F1',
          'text-0': '#AED6F1',
          'text-1': '#FEF5E7',
          'text-2': '#adb1aa',
        },
        custom_cards: [
          'https://s.widget-club.com/images/YyiR86zpwIMIfrCZoSs4ulVD9RF3/79fcde271c47643ed27611be0763ee86/1c4daad923d3841e6e173880fe0a76f9.jpg?q=70&w=500',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRzXzmG-BLY3dhF10J09EOlPRimImR129he2OoIIH1feaerKjMG9tldPHB6MmBFOc_eteM&usqp=CAU',
          'https://cdn.shopify.com/s/files/1/1034/3311/files/hydrangea-flowers-in-the-garden-picture-id927499422_1024x1024.jpg?v=1578384074',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAqC_Vlm2BYRpL1hZloGinds0TuLQ-D6UspWsOciaVcu3UlB3gBJfeDNhfHR0GEqsprJE&usqp=CAU',
          'https://t4.ftcdn.net/jpg/07/90/41/99/360_F_790419905_ksWKSHZJlugHfAcYgEAa5iQR4oVjxtoQ.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTy9Pnbaz605B-Rm7eeWzbptF6qyay7KEaovA&s',
          'https://as1.ftcdn.net/v2/jpg/06/08/69/46/1000_F_608694688_MuVFL7aLPz5O4zXMJ1NO17PRWHCoiyzG.jpg',
          'https://i.pinimg.com/474x/2d/d4/7e/2dd47e2846d4b02f7dcafd4a4895b14f.jpg',
          'https://static.vecteezy.com/system/resources/thumbnails/033/694/873/small/detailed-close-up-of-cornflower-petals-ai-generative-photo.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSs0epOLuYjq1u0hYZuyOWdO-X5g47qmBVZ85BIfcKojUnoo3a7Ze3_XWQZX3byilza7mQ&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRrhsrdGgRyasIP5vpf_PVWByqJUaTdhRW7s8KV_9qc7VexL3iWfcwK7m1aUaEI2qX07MU&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTo5uvFz2xXusUABOLSs6y4SjNeqC81-VfaoABMyWzSuWyjATrAbIgJRtYcOfUaZjQ_to&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQl9zD9sh2zNumtsFXuNs-eKoSIQ6g34fMH8VbKFEzu8Q2ht3s9T-XztRpXZXm3MstRJsw&usqp=CAU',
          'https://img.freepik.com/premium-photo/blue-flowers-wallpaper-iphone-is-best-high-definition-iphone-wallpaper-you-can-make-this-wallpaper-your-iphone-x-backgrounds-mobile-screensaver-ipad-lock-screen-iphone-blue_901003-2989.jpg?w=360',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ87NWgBHFJGpxiuIlnVZc9bDJkTCPuL3OQTg&s',
        ],
        card_colors: ['#AED6F1'],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTo5uvFz2xXusUABOLSs6y4SjNeqC81-VfaoABMyWzSuWyjATrAbIgJRtYcOfUaZjQ_to&usqp=CAU',
    },
    {
      color: 'black',
      score: 4440,
      title: "Junji's by ZYRI",
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#000000',
          borders: '#660000',
          links: '#660000',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://i.pinimg.com/736x/19/cb/41/19cb416efe3460163bd75b9966628a88.jpg")',
          'sidebar-text': '#fefefe',
          'text-0': '#fefefe',
          'text-1': '#fefefe',
          'text-2': '#fefefe',
        },
        custom_cards: [
          'https://steamuserimages-a.akamaihd.net/ugc/937210191362474664/607C139D48E34FCEE59C5DE1CA94E1E213524B8D/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false',
          'https://31.media.tumblr.com/e05e28845eb6b89d2eb51333f9d0b4c9/tumblr_mr0rrtZCMg1r863vto1_500.gif',
          'https://i.gifer.com/origin/30/304d8a0e60fee3123ba09ba97d066f0a.gif',
          'https://25.media.tumblr.com/95dcd5e1eff1a3da8084f63a1d4de29b/tumblr_mhgzfwVWWb1rz9t2lo1_500.gif',
          'https://64.media.tumblr.com/925022eecb2b88a39dbf49ce8bdbb7f9/tumblr_nvv75kWO8y1ubpkvbo4_500.gifv',
          'https://i.gifer.com/origin/51/51c1b756e0bcc517ddac23ba27c9353e.gif',
          'https://pa1.aminoapps.com/6707/0806159f35fa53c8113150d2e9698537e0a6c02f_hq.gif',
        ],
        card_colors: ['#660000'],
        custom_font: { family: "'Oswald'", link: 'Oswald:wght@400;700' },
      },
      preview:
        'https://64.media.tumblr.com/925022eecb2b88a39dbf49ce8bdbb7f9/tumblr_nvv75kWO8y1ubpkvbo4_500.gifv',
    },
    {
      color: 'green',
      score: 4440,
      title: 'GhibliGreen by mou',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#595f45',
          'background-1': '#283106',
          'background-2': '#595f45',
          borders: '#d1d8bd',
          links: '#C7C2AB',
          sidebar: '#283106',
          'sidebar-text': '#ffffff',
          'text-0': '#ffffff',
          'text-1': '#d1d8bd',
          'text-2': '#595f45',
        },
        custom_cards: [
          'https://media.giphy.com/media/yALcFbrKshfoY/giphy.gif',
          'https://media.giphy.com/media/4QTRR1Dhxp3zi/giphy.gif',
          'https://media.giphy.com/media/UByFQJYlKxprETlJ84/giphy.gif',
          'https://media.giphy.com/media/3MTQxYZeiDm12/giphy.gif',
          'https://media.giphy.com/media/Uz4cDaGXPxeuY/giphy.gif',
          'https://media.giphy.com/media/JyDMX1pVgdHl6/giphy.gif',
        ],
        card_colors: ['#C7C2AB'],
        custom_font: {
          family: "'Montserrat'",
          link: 'Montserrat:wght@400;700',
        },
      },
      preview: 'https://media.giphy.com/media/Uz4cDaGXPxeuY/giphy.gif',
    },
    {
      color: 'red',
      score: 4230,
      title: '21Pilots by Frnkie',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#271111',
          'background-1': '#000000',
          'background-2': '#271111',
          borders: '#ff0000',
          links: '#e1ff00',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://i.pinimg.com/736x/b0/2a/25/b02a25cf9ca54b6e8a804985709b95cd.jpg")',
          'sidebar-text': '#ff0000',
          'text-0': '#ff0000',
          'text-1': '#ff0000',
          'text-2': '#7a2929',
        },
        custom_cards: [
          'https://64.media.tumblr.com/e36043d2c2d549fc6f3d22336c88ab33/6c025a0f79455e3e-b0/s540x810/d81c28294f444808e2ae95ae7474b0b9919c2d62.gifv',
          'https://64.media.tumblr.com/67d6a6836966ed84e49ce1af2a5ebe02/aac53ded36abab40-b9/s540x810/1cc77fcf24c0f7491eb61c3d7be308c2219c2484.gifv',
          'https://64.media.tumblr.com/6ff385ea8b9945cb9bbede37698ae02f/1d0881deef1544c8-ee/s540x810/e60b36f1048259accd2991ceb5b4565b1c5ef837.gifv',
          'https://64.media.tumblr.com/bced58b452faa224f6a2dd0b33b59206/e13fbccd856cf0f0-69/s540x810/6210c9010a4078e3f23729d7f5ea5c7d686c4b86.gifv',
        ],
        card_colors: [],
        custom_font: { family: "'Oswald'", link: 'Oswald:wght@400;700' },
      },
      preview:
        'https://64.media.tumblr.com/bced58b452faa224f6a2dd0b33b59206/e13fbccd856cf0f0-69/s540x810/6210c9010a4078e3f23729d7f5ea5c7d686c4b86.gifv',
    },
    {
      color: 'brown',
      score: 2230,
      title: 'leopard by giselle',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#311a07',
          'background-1': '#543b17',
          'background-2': '#533409',
          borders: '#5f1633',
          links: '#6f3e16',
          sidebar: '#774b22',
          'sidebar-text': '#40240c',
          'text-0': '#f990aa',
          'text-1': '#f54747',
          'text-2': '#59391c',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/3b/99/99/3b999938fe4549323a4dcbcd277875c5.jpg',
          'https://i.pinimg.com/236x/5a/80/5a/5a805a1b9a1701a654216abcd88ced26.jpg',
          'https://i.pinimg.com/originals/e8/f6/23/e8f623068470235af9d189c8896309a5.jpg',
        ],
        card_colors: ['#ffffff', '#000000', '#ffffff'],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/736x/3b/99/99/3b999938fe4549323a4dcbcd277875c5.jpg',
    },
    {
      color: 'white',
      score: 4340,
      title: 'NURS by SasAnderson',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fef9f6',
          'background-1': '#fee4d2',
          'background-2': '#988381',
          borders: '#b9c5cf',
          links: '#89929a',
          sidebar:
            'linear-gradient(#efe1d7c7, #cda588c7), center url(https://i.pinimg.com/236x/33/9d/b2/339db24dd07a8016ff98f34de24b714e.jpg)',
          'sidebar-text': '#4c280b',
          'text-0': '#45230d',
          'text-1': '#a98970',
          'text-2': '#59453a',
        },
        custom_cards: [
          'https://www.ihplans.health/dist/img/IHP-animation.gif',
          'https://i.pinimg.com/originals/6d/e1/0f/6de10fff994dd378635dafbbaaee9b07.gif',
          'https://i.pinimg.com/originals/54/af/fe/54affec9687c83ebe4ab261f257ab4c1.gif',
          'https://i.pinimg.com/originals/28/37/0d/28370dbe32f501a356e5322839dc99c2.gif',
          'https://i.pinimg.com/originals/75/74/1c/75741cb26cd96a413ebe1a6945f2a558.gif',
          'https://aarp-content.brightspotcdn.com/dims4/default/7ef4b2e/2147483647/strip/true/crop/1090x600+225+0/resize/1752x964!/format/webp/quality/90/?url=http%3A%2F%2Faarp-brightspot.s3.amazonaws.com%2Fcontent%2F0f%2F11%2Fcfe6329e4662a12f756f1c0d2a71%2Fobgyn-alicemollon-1540x600.gif',
          'https://i.pinimg.com/originals/0f/4b/ce/0f4bce0aacd8423f445ad2c18197f653.gif',
        ],
        card_colors: [
          '#65499d',
          '#d97900',
          '#8d9900',
          '#06a3b7',
          '#f06291',
          '#ff2717',
          '#8f3e97',
        ],
        custom_font: { family: "'Oswald'", link: 'Oswald:wght@400;700' },
      },
      preview: 'https://www.ihplans.health/dist/img/IHP-animation.gif',
    },
    {
      color: 'green',
      score: 4340,
      title: 'MedStudent by y15',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#c1ad8a\t',
          'background-1': '#69644f',
          'background-2': '#766257',
          borders: '#273517',
          links: '#69644f',
          sidebar: 'linear-gradient(#69644f, #283618)',
          'sidebar-text': '#FFFFFF',
          'text-0': '#283618',
          'text-1': '#283618',
          'text-2': '#5e3e17',
        },
        custom_cards: [
          'https://i1.pickpik.com/photos/262/694/439/stethoscope-doctor-health-care-thumb.jpg',
          'https://i.pinimg.com/564x/04/b3/96/04b3963f3c38a526cca300678aa3afd8.jpg',
          'https://c8.alamy.com/comp/2C5BRKB/muscleman-anatomy-heroic-body-doing-a-bodybuilder-pose-three-in-white-background-close-up-3d-illustration-2C5BRKB.jpg',
        ],
        card_colors: ['#636363'],
        custom_font: { family: "'Tektur'", link: 'Tektur:wght@400;700' },
      },
      preview:
        'https://i1.pickpik.com/photos/262/694/439/stethoscope-doctor-health-care-thumb.jpg',
    },
    {
      color: 'yellow',
      score: 4340,
      title: 'Garfield by Pookie',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f8fea9',
          'background-1': '#fed886',
          'background-2': '#ffe8b8',
          borders: '#ffd952',
          links: '#ca8612',
          sidebar: '#d2772d',
          'sidebar-text': '#ffda9e',
          'text-0': '#b46027',
          'text-1': '#a95c28',
          'text-2': '#c69b24',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/9f/4f/50/9f4f500c678a05adb6400f2c13d2e806.jpg',
          'https://i.pinimg.com/474x/97/83/c2/9783c21ff500a90ed7610a2f2d9ee9e8.jpg',
          'https://i.pinimg.com/564x/56/3c/ca/563ccacebffe196a92c5b59309262d39.jpg',
          'https://i.pinimg.com/564x/2a/80/ec/2a80ec50872f5364158022b71073a442.jpg',
        ],
        card_colors: ['#ffc971', '#ffb627', '#ff9505', '#e2711d'],
        custom_font: {
          family: "'Happy Monkey'",
          link: 'Happy+Monkey:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/56/3c/ca/563ccacebffe196a92c5b59309262d39.jpg',
    },
    {
      color: 'white',
      score: 4430,
      title: 'PinkStudy by Erecia',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#ffffff',
          'background-2': '#ffffff',
          borders: '#f9d7df',
          links: '#463434',
          sidebar:
            'linear-gradient(#e16b88c7, #ff9eb6c7), center url("https://i.pinimg.com/564x/c3/eb/03/c3eb03220397ad0af821827acbf62770.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#ff9db6',
          'text-1': '#d8748d',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/54/43/78/544378f4ed1db90513dd0df22604c9f2.jpg',
        ],
        card_colors: ['#ff9eb6'],
        custom_font: { family: "'Lora'", link: 'Lora:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/54/43/78/544378f4ed1db90513dd0df22604c9f2.jpg',
    },
    {
      color: 'lightgreen',
      score: 2440,
      title: 'Calm by Maggie',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e5e6e5',
          'background-1': '#d4cece',
          'background-2': '#bababa',
          borders: '#67836d',
          links: '#394332',
          sidebar:
            'linear-gradient(#59825ec7, #59825ec7), center url("https://media3.giphy.com/media/udNanjwUiRTQAKLejo/200w.webp?cid=ecf05e47p3jcszd71o977dyywi00vm9j4z7awbh0uc7ujb6j&ep=v1_gifs_related&rid=200w.webp&ct=g")',
          'sidebar-text': '#26371a',
          'text-0': '#2a3f1c',
          'text-1': '#1d3111',
          'text-2': '#1d2d10',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/fa/62/1c/fa621c222352df35e79641ac909bfecb.jpg',
          'https://gifdb.com/images/high/spirea-flowers-blossom-qilalpqudypaf9vk.gif',
          'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExanl2Y3p0b2Y1M2tucmRqNmtkMjNsYTBtN29zbGcxaGQzbHpieXd1MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/daMMlb1K9ERQ4L0xU4/giphy.webp',
          'https://media1.giphy.com/media/IV1oQSR67yUbfklywp/200w.webp?cid=ecf05e47katgw5z0zct1iavh6ba29qhtq0otv740sll3vt6d&ep=v1_gifs_related&rid=200w.webp&ct=g',
          'https://64.media.tumblr.com/9e0731c5fd8e97d29a6f1f6928355572/tumblr_p2zkqfzA4B1wxub9uo1_1280.gif',
        ],
        card_colors: [
          '#ddead1',
          '#4b6043',
          '#85bb72',
          '#009606',
          '#758753',
          '#878b69',
          '#658354',
          '#333d29',
          '#b3cf99',
        ],
        custom_font: { family: "'Jost'", link: 'Jost:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/474x/fa/62/1c/fa621c222352df35e79641ac909bfecb.jpg',
    },
    {
      color: 'purple',
      score: 2340,
      title: 'ALNST by Udon',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#4a204b',
          'background-1': '#1b0e7b',
          'background-2': '#000000',
          borders: '#3621a1',
          links: '#f8b4fd',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://www.usatoday.com/web-stories/what-is-the-brightest-star-in-the-sky/assets/6.jpeg")',
          'sidebar-text': '#472e5c',
          'text-0': '#a058d0',
          'text-1': '#6a72e7',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://pbs.twimg.com/media/F4dNEEzbQAA3H15.jpg',
          'https://i.ytimg.com/vi/DIaeHN3sNtk/sddefault.jpg',
          'https://i.ytimg.com/vi/7Wm3cWDhonE/hq720.jpg?sqp=-oaymwEXCK4FEIIDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLAU-ANm3XeHBA6HP4U-9nqNa0dTjw',
          'https://otakuusamagazine.com/wp-content/uploads/2023/02/ousa_alienstage_hero.png',
          'https://i.ytimg.com/vi/qQlVtAiFARI/hq720.jpg?sqp=-oaymwEXCK4FEIIDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLBgNvpNw0NdhTL0qpcyzTsVZPBQ7A',
          'https://i1.ytimg.com/vi/VgPo3q01kbg/0.jpg',
          'https://i.ytimg.com/vi/SV9SwKd6J3w/hq720.jpg?sqp=-oaymwEXCK4FEIIDSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLCq5SwsMidZAaIX5HGmrZSWwXemtQ',
          'https://i.ytimg.com/vi/NUkrMIhTZ0w/maxresdefault.jpg',
          'https://i.ytimg.com/vi/JBbbSGRHZpo/hqdefault.jpg',
        ],
        card_colors: [
          '#1b14b8',
          '#3411c1',
          '#4d0fca',
          '#650cd3',
          '#7e0adb',
          '#9707e4',
          '#af05ed',
          '#c802f6',
          '#e100ff',
        ],
        custom_font: { family: "'Comfortaa'", link: 'Comfortaa:wght@400;700' },
      },
      preview: 'https://i1.ytimg.com/vi/VgPo3q01kbg/0.jpg',
    },
    {
      color: 'white',
      score: 3340,
      title: 'SilentVoice by FatUnicorn2797',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#ffe0ed',
          'background-2': '#f986b4',
          borders: '#ff007b',
          links: '#68cdee',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://i.pinimg.com/564x/cd/69/8e/cd698ee97e942d012372afb2bab50804.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#f269b9',
          'text-1': '#729ada',
          'text-2': '#f561a1',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/2a/ee/64/2aee6403ca8319c217c4bc30b3b68be6.gif',
          'https://i.pinimg.com/originals/13/71/90/1371902eb00ba3a753ecb49143b160f8.gif',
          'https://i.pinimg.com/originals/c5/8a/27/c58a270b5820be28f08ab04fb61880e2.gif',
          'https://i.pinimg.com/originals/ec/36/64/ec36641a8234d3c6abbe2ccf13f8eeb6.gif',
          'https://i.pinimg.com/originals/ee/99/e6/ee99e620254b1f239de7296cdb0f40b0.gif',
          'https://i.pinimg.com/originals/1c/71/c1/1c71c157f9a62895194dd2c8cb72516c.gif',
        ],
        card_colors: ['#76d3ea'],
        custom_font: { family: "'Rubik'", link: 'Rubik:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/1c/71/c1/1c71c157f9a62895194dd2c8cb72516c.gif',
    },
    {
      color: 'lightgreen',
      score: 4440,
      title: 'RelaxingGreen by Ally',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#f5f5f5',
          'background-2': '#d4d4d4',
          borders: '#3a643a',
          links: '#99c482',
          sidebar: '#99c482',
          'sidebar-text': '#3a643a',
          'text-0': '#3a643a',
          'text-1': '#919191',
          'text-2': '#a5a5a5',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/16/60/b8/1660b85e57adc6ba8b5c08e430bd6a2d.jpg',
          'https://i.pinimg.com/564x/10/c9/25/10c925f2abb468aca4430c2662a15b05.jpg',
          'https://i.pinimg.com/736x/ab/f8/91/abf891cbb067011d94b62172fb96fc54.jpg',
          'https://i.pinimg.com/564x/76/d6/bb/76d6bb4ee2bcf2ee4774d4c9761bb25c.jpg',
        ],
        card_colors: ['#99c482'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://i.pinimg.com/736x/ab/f8/91/abf891cbb067011d94b62172fb96fc54.jpg',
    },
    {
      color: 'pink',
      score: 3440,
      title: 'Coquette by Cecilia',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#feecf3',
          'background-1': '#ffe0ed',
          'background-2': '#ffd8f0',
          borders: '#ffd1dc',
          links: '#a84860',
          sidebar: '#f490b3',
          'sidebar-text': '#ffffff',
          'text-0': '#904860',
          'text-1': '#ff8f8f',
          'text-2': 'black',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/55/2c/9d/552c9dd32a9f1122e9b780e66c23f848.jpg',
          'https://i.pinimg.com/564x/09/ef/16/09ef16f8c051d8444b5e1f6737b354f8.jpg',
          'https://i.pinimg.com/474x/f7/41/94/f741947d50edf3b0e800045f63e122c7.jpg',
          'https://i.pinimg.com/474x/8a/60/32/8a60326b86edda82b80fac62305bd29f.jpg',
          'https://i.pinimg.com/474x/fb/15/57/fb15572793bd7d1f3fa78aa5747789c3.jpg',
          'https://i.pinimg.com/474x/3c/64/47/3c644705cfd8593f46941ae34d8c6467.jpg',
          'https://i.pinimg.com/474x/ca/4d/d8/ca4dd84835b9af7ef665494afc2a937e.jpg',
        ],
        card_colors: [
          '#cdb4db',
          '#ffc8dd',
          '#ffafcc',
          '#bde0fe',
          '#bde0fe',
          '#cdb4db',
          '#ffc8dd',
        ],
        custom_font: { family: "'Comfortaa'", link: 'Comfortaa:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/474x/fb/15/57/fb15572793bd7d1f3fa78aa5747789c3.jpg',
    },
    {
      color: 'white',
      score: 3330,
      title: 'BtS7 by KRISSY',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#e3b2f5',
          'background-2': '#99e1ea',
          borders: '#d185d6',
          links: '#ff0088',
          sidebar:
            'linear-gradient(#d78beec7, #79a08ec7), center url("https://i.pinimg.com/564x/78/ae/87/78ae87096d360a6f4854b2faf7ecac70.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#ffdd00',
          'text-1': '#734baf',
          'text-2': '#ff5c5c',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/fa/13/32/fa1332003b153fb3aca80721077b6809.jpg',
          'https://i.pinimg.com/564x/cc/46/41/cc4641f9ea73a8567c88a9e935b0300a.jpg',
          'https://i.pinimg.com/564x/c7/0d/66/c70d66b426e768c48d40edcdad775eab.jpg',
          'https://i.pinimg.com/564x/7d/d6/2a/7dd62a811523bbe3d1c5aa2771a9324b.jpg',
        ],
        card_colors: ['#e174dc', '#d872df', '#d071e2', '#c76fe5'],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/c7/0d/66/c70d66b426e768c48d40edcdad775eab.jpg',
    },
    {
      color: 'pink',
      score: 4440,
      title: 'Soft by Brooke',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fef6f9',
          'background-1': '#ffe0ed',
          'background-2': '#cdb4db',
          borders: '#cdb4db',
          links: '#ea9acc',
          sidebar: '#ffc8dd',
          'sidebar-text': '#ffffff',
          'text-0': '#ffc8dd',
          'text-1': '#cdb4db',
          'text-2': '#ea9acc',
        },
        custom_cards: [
          'https://www.wallpaperstogo.com/images/product/large/257435.jpg',
          'https://i.pinimg.com/564x/76/ee/18/76ee18a18f84db926dc70f1304ac1f13.jpg',
          'https://garden.spoonflower.com/c/14818402/p/f/m/XvKkFLzlKC4DVxgV-35s3sF_Tccuj_S7xb3Hxrn30X-JdfrZgHSRWq7BnQ/Small%20Vintage%20Victorian%20Bone%20China%20Porcelain%20Teapot%20and%20Tea%20Cup%20Set%20with%20White%20Background%20.jpg',
          'https://cdn.vectorstock.com/i/1000v/67/68/coquette-strawberry-with-bow-seamless-pattern-vector-50366768.jpg',
          'https://wallpapers.com/images/hd/pink-bunniesand-bows-pattern-45r38jr17fahnn9r.jpg',
          'https://static.vecteezy.com/system/resources/previews/038/357/288/original/cute-coquette-aesthetic-pattern-seamless-pink-ribbon-bow-outline-isolated-on-white-background-vector.jpg',
          'https://www.wallpaperstogo.com/images/product/large/257426.jpg',
        ],
        card_colors: [
          '#cdb4db',
          '#ffc8dd',
          '#ffafcc',
          '#ea9acc',
          '#ea9acc',
          '#cdb4db',
          '#ffc8dd',
        ],
        custom_font: { family: '', link: '' },
      },
      preview: 'https://www.wallpaperstogo.com/images/product/large/257426.jpg',
    },
    {
      color: 'red',
      score: 3440,
      title: 'sweetbeach by kassandra',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f2cfcf',
          'background-1': '#c16c6c',
          'background-2': '#ffd6da',
          borders: '#d9abab',
          links: '#ac7278',
          sidebar:
            'linear-gradient(#daaaaac7, #f7c5c5c7), center url("https://i.pinimg.com/736x/c1/2d/24/c12d24a0bf5f995264c7eed8b171b77a.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#b62f3f',
          'text-1': '#694f4f',
          'text-2': '#ab6969',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/25/c6/e5/25c6e5e4c6995ee68a065b5a9a1e8fcd.jpg',
          'https://i.pinimg.com/736x/34/71/8e/34718e4a1f7072f2973f87879f902026.jpg',
          'https://i.pinimg.com/736x/97/4d/7f/974d7fc221c0cfc8b7f295e4b0aca1d9.jpg',
          'https://i.pinimg.com/474x/47/0b/ec/470bec92fc1977c84d86e616e0537537.jpg',
          'https://i.pinimg.com/474x/95/6b/8a/956b8a8f2a737e976fff4c5cf0287b2b.jpg',
          'https://i.pinimg.com/474x/0c/01/5d/0c015dddbdfd82d8137a82c141d0259f.jpg',
          'https://i.pinimg.com/474x/0e/ed/df/0eeddf9e408d26debe233e7a80b020e9.jpg',
          'https://i.pinimg.com/474x/03/f5/20/03f520e6e741c0de846a9a272a1f6c40.jpg',
          'https://i.pinimg.com/736x/95/3f/86/953f863724228bd23ce70e987ee3f0a8.jpg',
        ],
        card_colors: ['#b77179'],
        custom_font: { family: "'Quicksand'", link: 'Quicksand:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/474x/03/f5/20/03f520e6e741c0de846a9a272a1f6c40.jpg',
    },
    {
      color: 'pink',
      score: 4340,
      title: 'PrincessJellyfish by StaticSpace',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffcce0',
          'background-1': '#f5e0bc',
          'background-2': '#ff5297',
          borders: '#f5e0bc',
          links: '#ff0095',
          sidebar:
            'linear-gradient(#fd63a1c7, #f78959c7), center url("https://i.pinimg.com/564x/f1/0b/a2/f10ba2271378b4b3532b2dfe27e1b290.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#ff0095',
          'text-1': '#ff0095',
          'text-2': '#ffa55c',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/20/38/56/203856363aa3a9041ed9bdd30e54cd50.jpg',
          'https://i.pinimg.com/564x/86/ba/60/86ba6038146120d94db52943a9096c86.jpg',
          'https://i.pinimg.com/564x/6f/06/10/6f0610b9801e109fa55a1f752610ecee.jpg',
          'https://i.pinimg.com/564x/68/a7/1d/68a71dfba240efd8eb25523c72e1fbaa.jpg',
        ],
        card_colors: ['#ff75a8', '#f06291', '#ff809d', '#e71f63'],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/86/ba/60/86ba6038146120d94db52943a9096c86.jpg',
    },
    {
      color: 'gray',
      score: 4440,
      title: 'JujutsuManga by Brooke',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#aaaabc',
          'background-1': '#5b62a0',
          'background-2': '#5b62a0',
          borders: '#000000',
          links: '#36417b',
          sidebar:
            'linear-gradient(#5b62a0c7, #5b62a0c7), center url("https://i.pinimg.com/736x/c1/9f/d4/c19fd4cda69a37d977464d7e8c76ea51.jpg")',
          'sidebar-text': '#000000',
          'text-0': '#000000',
          'text-1': '#000000',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/92/9c/bc/929cbcc9410ef63a00b88e1b3cb5f7e3.jpg',
          'https://i.pinimg.com/564x/2f/cd/49/2fcd497522335c1d716284a181c4ea09.jpg',
          'https://i.pinimg.com/564x/72/09/d4/7209d45803420aea9ee4674855e34cef.jpg',
          'https://i.pinimg.com/564x/e6/02/9d/e6029df9b9c25c9102e883dd4a86d47f.jpg',
          'https://i.pinimg.com/564x/7d/86/91/7d8691f297196aa49aef5d52be87998d.jpg',
          'https://i.pinimg.com/564x/3c/58/77/3c5877be8e8de5ba4e3b38921ad8572d.jpg',
        ],
        card_colors: ['#000035'],
        custom_font: { family: "'Lato'", link: 'Lato:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/e6/02/9d/e6029df9b9c25c9102e883dd4a86d47f.jpg',
    },
    {
      color: 'gray',
      score: 4430,
      title: 'Nord by XXI0',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#3b4252',
          'background-1': '#434c5e',
          'background-2': '#2e3440',
          borders: '#4c566a',
          links: '#88c0d0',
          sidebar: 'linear-gradient(#3b4252, #2e3440)',
          'sidebar-text': '#eceff4',
          'text-0': '#eceff4',
          'text-1': '#e5e9f0',
          'text-2': '#d8dee9',
        },
        custom_cards: [
          'https://preview.redd.it/some-wallpapers-i-made-4k-v0-n0nwschtkbv81.png?width=1080&crop=smart&auto=webp&s=b9c7c63be4a1621df193bb382677b7941fcbbc24',
        ],
        card_colors: ['#eceff4'],
        custom_font: { family: "'Ubuntu'", link: 'Ubuntu:wght@400;700' },
      },
      preview:
        'https://preview.redd.it/some-wallpapers-i-made-4k-v0-n0nwschtkbv81.png?width=1080&crop=smart&auto=webp&s=b9c7c63be4a1621df193bb382677b7941fcbbc24',
    },
    {
      color: 'brown',
      score: 2340,
      title: 'ForestFellow by Jordan',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#221207',
          'background-1': '#211e08',
          'background-2': '#181502',
          borders: '#836f0c',
          links: '#9b590d',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://preview.redd.it/a-little-forest-fellow-enjoying-the-autumnal-vibes-v0-uadepuf3zjyb1.png?width=640&crop=smart&auto=webp&s=752fedf8954b6be3edd3c9768d449879b05e02d4")',
          'sidebar-text': '#ddcf9c',
          'text-0': '#ddcf9c',
          'text-1': '#ddcf9c',
          'text-2': '#ddcf9c',
        },
        custom_cards: [
          'https://media.tenor.com/rMDyntfWipoAAAAe/little-forest-fellow-littleforestfellow.png',
          'https://media.tenor.com/nSe6_25F_2cAAAAi/littleforestfellow-little-forest-fellow.gif',
          'https://media.tenor.com/-QYmumhYyW0AAAAi/littleforestfellow-in.gif',
          'https://i.ytimg.com/vi/DX-O8My_W88/maxresdefault.jpg',
          'https://pbs.twimg.com/media/GK5lWifXMAAQICh.png',
          'https://media.tenor.com/OAaoaZKdgWMAAAAi/littleforestfellow-little-forest-fellow.gif',
        ],
        card_colors: [
          '#70798c',
          '#91349b',
          '#e1185c',
          '#177b63',
          '#626e7b',
          '#585481',
        ],
        custom_font: { family: "'Comfortaa'", link: 'Comfortaa:wght@400;700' },
      },
      preview:
        'https://media.tenor.com/rMDyntfWipoAAAAe/little-forest-fellow-littleforestfellow.png',
    },
    {
      color: 'blue',
      score: 4440,
      title: 'DarkFloral by brittany',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#304050',
          'background-1': '#522623',
          'background-2': '#6a2711',
          borders: '#AF4638',
          links: '#92ADA4',
          sidebar:
            'linear-gradient(#4f4f4fc7, #242424c7), center url("https://daysinspired.com/wp-content/uploads/2024/03/new-dark-academia-2.jpg")',
          'sidebar-text': '#daa38f',
          'text-0': '#d87D64',
          'text-1': '#BEC7CE',
          'text-2': '#C47457',
        },
        custom_cards: [
          'https://daysinspired.com/wp-content/uploads/2024/03/new-dark-academia-4.jpg',
          'https://daysinspired.com/wp-content/uploads/2024/03/dark-academia-phone-wallpaper-34.jpg',
          'https://daysinspired.com/wp-content/uploads/2024/03/new-dark-academia-2.jpg',
        ],
        card_colors: ['#b2421f', '#f4b7ab', '#f4b787'],
        custom_font: { family: "'Poppins'", link: 'Poppins:wght@400;700' },
      },
      preview:
        'https://daysinspired.com/wp-content/uploads/2024/03/new-dark-academia-2.jpg',
    },
    {
      color: 'purple',
      score: 3340,
      title: 'MP100 by Ravi',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#080d26',
          'background-1': '#2c0740',
          'background-2': '#c497b8',
          borders: '#c497b8',
          links: '#779dc5',
          sidebar:
            'linear-gradient(#4c1273c7, #2e1d81c7), center url("https://i.pinimg.com/564x/0f/12/04/0f1204092688e04a6bf48915709bdf93.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#7b97b2',
          'text-1': '#c266ff',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://64.media.tumblr.com/8ec33af1086e3a2cdff13b1336c7a0eb/10a5730e5ffc6816-75/s540x810/98d389c6ea85d80bd227283954869f3931d946cf.gifv',
          'https://64.media.tumblr.com/fcc2576848e77a9d02624950d2c9cbe9/589adec157ef567d-05/s500x750/be83907fbdfea72eee85e91cca091496dad1a712.gifv',
          'https://64.media.tumblr.com/92c4c457b3e8d5bd8f7e895cfa03259a/9438766625fc1f64-f0/s540x810/ad5ec360925ad20fb7369b6a8ae6a193723e708b.gifv',
          'https://64.media.tumblr.com/178332fa3336b55d0838ea8e7b862d98/tumblr_p9j4bnNB8E1qfq1l5o2_540.gifv',
          'https://64.media.tumblr.com/9422d0e609e5420850dfc27fee5769b6/ae2e5b245a598a92-bb/s540x810/e619b7e20c00299a425dc3ff4c2137fc82c1706c.gifv',
          'https://64.media.tumblr.com/a258fcd7280f6664d00de02a4b8180b5/tumblr_plfq5mdOTi1sp1hq9o4_540.gifv',
          'https://64.media.tumblr.com/b31508b026e25ce6da2ddad9ef7c3fa0/15e24d443972898e-ae/s400x600/8bb7ce6063b55cf4f56c1c1a31e66d561b00b9c9.gifv',
        ],
        card_colors: [
          '#411f8d',
          '#36268f',
          '#2c2e92',
          '#213594',
          '#173d97',
          '#0c4499',
          '#024c9c',
          '#411f8d',
          '#36268f',
          '#2c2e92',
          '#213594',
          '#173d97',
          '#0c4499',
        ],
        custom_font: {
          family: "'Comic Neue'",
          link: 'Comic+Neue:wght@400;700',
        },
      },
      preview:
        'https://64.media.tumblr.com/9422d0e609e5420850dfc27fee5769b6/ae2e5b245a598a92-bb/s540x810/e619b7e20c00299a425dc3ff4c2137fc82c1706c.gifv',
    },
    {
      color: 'blue',
      score: 4440,
      title: 'Furina by Cookie',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#366896',
          'background-1': '#4284c2',
          'background-2': '#4489ca',
          borders: '#29567f',
          links: '#a8caff',
          sidebar: 'linear-gradient(#29567f, #3772a9)',
          'sidebar-text': '#89a7d7',
          'text-0': '#89a7d7',
          'text-1': '#89a7d7',
          'text-2': '#89a7d7',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/34/c4/be/34c4beb31aae506d6d4ce8c816885ded.jpg',
          'https://s1.zerochan.net/Furina.600.3980848.jpg',
          'https://i.pinimg.com/736x/42/75/29/42752965b90aab769a69cfa988f06307.jpg',
          'https://steamuserimages-a.akamaihd.net/ugc/2045245270070890734/C310D7D51F489B22E2821FF5F01B0027EEA74FCB/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false',
          'https://4kwallpapers.com/images/wallpapers/furina-5k-genshin-1920x1080-13884.jpg',
          'https://i.ytimg.com/vi/DZaCeSuPAdw/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDOPz2f8SIRXdsivTTFH71b9606bA',
          'https://static1.srcdn.com/wordpress/wp-content/uploads/2023/11/genshin-impact-furina-best-builds-team-comps-artifacts-stats.jpg',
          'https://static1.thegamerimages.com/wordpress/wp-content/uploads/2023/11/furina-de-fontaine-genshin-impact.jpg',
          'https://imgix.bustle.com/uploads/image/2023/11/13/5cb65ce0-0c12-47a4-8339-548ecdf764b0-hed.jpg?w=400&h=300&fit=crop&crop=focalpoint&q=50&dpr=2&fp-x=0.3371&fp-y=0.4227',
          'https://pbs.twimg.com/media/GENkzTzXgAArOk1.jpg',
          'https://i.ytimg.com/vi/zSUswOSfQB4/hqdefault.jpg',
          'https://i1.sndcdn.com/artworks-hzYVgyUxwDXjbLIG-UJsDNA-t500x500.jpg',
        ],
        card_colors: [
          '#74a0da',
          '#7aa5dc',
          '#80aadf',
          '#86afe1',
          '#8cb4e4',
          '#93b9e6',
          '#99bee8',
          '#9fc3eb',
          '#a5c8ed',
          '#abcdf0',
          '#b1d2f2',
          '#b8d7f5',
        ],
        custom_font: { family: "'Caveat'", link: 'Caveat:wght@400;700' },
      },
      preview: 'https://pbs.twimg.com/media/GENkzTzXgAArOk1.jpg',
    },
    {
      color: 'white',
      score: 4340,
      title: 'cutesyaura by g1rldivision',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fcfcfc',
          'background-1': '#ffffff',
          'background-2': '#ffffff',
          borders: '#b3ff80',
          links: '#ffab66',
          sidebar: 'linear-gradient(#ffd8d1, #ffc342)',
          'sidebar-text': '#ffffff',
          'text-0': '#ffab66',
          'text-1': '#ffb3b3',
          'text-2': '#d5fb8e',
        },
        custom_cards: [
          'https://th.bing.com/th/id/R.e78169156af9980452c50b8e1e1dd7d3?rik=DQgUBvxmp20dOw&pid=ImgRaw&r=0',
          'https://i.pinimg.com/564x/67/1e/f0/671ef0e980af09d3aa2d79c1bf7d0fc7.jpg',
          'https://i.pinimg.com/564x/e9/e8/ba/e9e8ba1bee51e855713cbf20730238b1.jpg',
        ],
        card_colors: ['#cdb4db', '#ffc8dd', '#ffafcc'],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/e9/e8/ba/e9e8ba1bee51e855713cbf20730238b1.jpg',
    },
    {
      color: 'black',
      score: 3330,
      title: 'Elden Ring by Ren',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#350303',
          'background-2': '#5e5661',
          borders: '#140e21',
          links: '#ac8b53',
          sidebar:
            'linear-gradient(#372020c7, #2f2c30c7), center url("https://static.displate.com/857x1200/displate/2020-08-13/8812c0941dd76bd3b1df67bb88249249_b14088eef3ad5124795a7d60d78e5ba6.jpg")',
          'sidebar-text': '#f2f2f2',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://eldenring.wiki.fextralife.com/file/Elden-Ring/blacksmith_hewg_npcs_elden_ring_wiki_600px.jpg',
          'https://c4.wallpaperflare.com/wallpaper/632/313/136/elden-ring-radahn-hd-wallpaper-preview.jpg',
          'https://static1.thegamerimages.com/wordpress/wp-content/uploads/2023/03/collage-maker-08-mar-2023-01-40-pm-4605.jpg',
        ],
        card_colors: ['#ac8b53'],
        custom_font: { family: "'Cinzel'", link: 'Cinzel:wght@400;700' },
      },
      preview:
        'https://eldenring.wiki.fextralife.com/file/Elden-Ring/blacksmith_hewg_npcs_elden_ring_wiki_600px.jpg',
    },
    {
      color: 'pink',
      score: 3440,
      title: 'Prettypink by Arleth',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffe0ed',
          'background-1': '#ffe0ed',
          'background-2': '#ff0066',
          borders: '#ff007b',
          links: '#ff007b',
          sidebar:
            'linear-gradient(#ffe0edc7, #ffe0edc7), center url("https://i.pinimg.com/236x/f2/88/f7/f288f775c74cc912840b80c82ff0843f.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#ff007b',
          'text-1': '#ff0498',
          'text-2': '#ff0498',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/44/47/c8/4447c8fc8cc4d34671f6765fea275d08.jpg',
          'https://i.pinimg.com/236x/1b/3a/43/1b3a433897a8ae1f20fc8b9025130c38.jpg',
          'https://i.pinimg.com/236x/bc/47/64/bc4764cb3ddf8de53d3ab438ef3c5999.jpg',
          'https://i.pinimg.com/474x/6c/36/02/6c3602265220074917b7144dbf0b1f61.jpg',
          'https://i.pinimg.com/236x/45/5f/76/455f764690213c75429f37e236519d07.jpg',
          'https://i.pinimg.com/236x/e0/41/06/e041068f2b435c66a46df8cb9b7db0b1.jpg',
          'https://www.zingerbug.com/Backgrounds/background_images/hot_pink_starburst_fractal_background_1800x1600.jpg',
          'https://i.pinimg.com/474x/50/cf/94/50cf946270bb9825bc715bc1be17130c.jpg',
        ],
        card_colors: [
          '#ff0a54',
          '#ff5c8a',
          '#ff85a1',
          '#ff99ac',
          '#fbb1bd',
          '#ff0a54',
          '#ff5c8a',
          '#ff85a1',
        ],
        custom_font: { family: "'Quicksand'", link: 'Quicksand:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/236x/45/5f/76/455f764690213c75429f37e236519d07.jpg',
    },
    {
      color: 'blue',
      score: 4440,
      title: 'Mermaid! by Mercedes',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#84c9d7',
          'background-1': '#edeeee',
          'background-2': '#e5a4bb',
          borders: '#fb7f56',
          links: '#2b7d8d',
          sidebar:
            'linear-gradient(#ffecd1c7, #ffecd1c7), center url("https://i.pinimg.com/736x/30/40/3f/30403f798a6414594276a5e6d4ef3ef9.jpg")',
          'sidebar-text': '#2b7d8d',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/37/35/14/373514a2e76d3f9fe0b3d7993de2ef8f.jpg',
          'https://i.pinimg.com/474x/2a/76/bb/2a76bb7915108807bcb7da8f48ca4d36.jpg',
          'https://i.pinimg.com/736x/6b/55/f1/6b55f1ca374d156c7c7bb01fb8ae9b99.jpg',
          'https://i.pinimg.com/736x/15/72/5b/15725bbb2e6d8af7790253b78b9e9582.jpg',
          'https://i.pinimg.com/564x/79/58/92/795892b40c15378ba7d568581a52cfa0.jpg',
          'https://i.pinimg.com/564x/4d/de/ee/4ddeeeb86f331117123adccf36fd87d6.jpg',
          'https://i.pinimg.com/736x/99/15/7d/99157d29c0f28bfb28985a55900e27b2.jpg',
          'https://i.pinimg.com/474x/ac/e1/e3/ace1e34c264db7c5fffe506126876348.jpg',
          'https://i.pinimg.com/474x/a3/10/39/a310397f2997fd49a0c1fb4ba284a07c.jpg',
        ],
        card_colors: ['#2b7d8d'],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/474x/2a/76/bb/2a76bb7915108807bcb7da8f48ca4d36.jpg',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'Evermore TS by Mari',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#d7d0bc',
          'background-1': '#994914',
          'background-2': '#625d52',
          borders: '#51201b',
          links: '#cc621b',
          sidebar: '#994914',
          'sidebar-text': '#d7d0bc',
          'text-0': '#51201b',
          'text-1': '#51201b',
          'text-2': '#7f3c10',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/28/55/cf/2855cfd864791a121c7ddd12eb3657d0.jpg',
          'https://i.pinimg.com/564x/56/be/e8/56bee8f7be74bacf3da4cd0c5f948b42.jpg',
          'https://i.pinimg.com/564x/cc/5e/fa/cc5efa50d655e3826266dfce6dd7618f.jpg',
          'https://i.pinimg.com/736x/c3/b7/65/c3b765c5c9630a20d39a975e52132e4b.jpg',
        ],
        card_colors: ['#cc621b'],
        custom_font: { family: "'Poppins'", link: 'Poppins:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/28/55/cf/2855cfd864791a121c7ddd12eb3657d0.jpg',
    },
    {
      color: 'lightblue',
      score: 1340,
      title: 'OuranHostClub by Kit',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#DBEBFF',
          'background-1': '#D4D0ED',
          'background-2': '#ffafcc',
          borders: '#bde0fe',
          links: '#cdb4db',
          sidebar:
            'linear-gradient(#FF70A5c7, #85C4FFc7), center url("https://i.pinimg.com/564x/74/1b/97/741b97d2ca93cebe2840e13ce1cd5d44.jpg")',
          'sidebar-text': '#cccccc',
          'text-0': '#8568A1',
          'text-1': '#74598F',
          'text-2': '#fb6f92',
        },
        custom_cards: [
          'https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExMGozZG55MDJtNTh3MjZsbThjNTUwYWcxc2M3empuMXZydnB0YXpicSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/PcbGFG1GnznQDisCMS/giphy.gif',
          'https://pa1.aminoapps.com/7011/c2a2a6cb2599e173a2e9702e5970f8cdb8b28f5er1-500-281_hq.gif',
          'https://24.media.tumblr.com/tumblr_m7fv7i6OXl1r7c8cqo1_500.gif',
          'https://i.pinimg.com/originals/83/7c/bf/837cbf528764447063102b0b547686d5.gif',
          'https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExbGVseXlpcTA1b2FjaHE0aXRiNGRzNzR4ajJucWk4b3ZnbXc5c3p4MSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lWtmOf4gj1JYtjcwxT/giphy.gif',
          'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGg5Ym82a2JsNXFpZGNzNWtwemRmcnNubXlrbDE5NjQ5eWJsdHZiZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hNyZFIJaVZ52YKA3it/giphy.gif',
        ],
        card_colors: [
          '#8bd6f9',
          '#ffca85',
          '#ffa985',
          '#d8a9db',
          '#f7b6cb',
          '#a9b3db',
        ],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview: 'https://64.media.tumblr.com/tumblr_m7fv7i6OXl1r7c8cqo1_500.gif',
    },
    {
      color: 'gray',
      score: 4440,
      title: 'Claude Monet by sodajelli',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#acb8b9',
          'background-1': '#c7d6c6',
          'background-2': '#f3eae5',
          borders: '#aaac8e',
          links: '#eef0d5',
          sidebar: '#dccfd9',
          'sidebar-text': '#bfb8c0',
          'text-0': '#fbf4e4',
          'text-1': '#eef0d5',
          'text-2': '#fbf4e4',
        },
        custom_cards: [
          'http://www.theswissfreis.com/wp-content/uploads/2017/05/Water-Lilies.jpg',
          'http://upload.wikimedia.org/wikipedia/commons/2/2a/Claude_Monet_040.jpg',
          'http://uploads6.wikiart.org/images/claude-monet/water-lilies-9.jpg',
          'https://s3.amazonaws.com/images.ecwid.com/images/26990047/2076317440.jpg',
          'https://images-na.ssl-images-amazon.com/images/I/81Z1pjppGoL._AC_SL1500_.jpg',
          'http://www.metmuseum.org/toah/images/h2/h2_29.100.113.jpg',
        ],
        card_colors: ['#eef0d5'],
        custom_font: { family: "'Poppins'", link: 'Poppins:wght@400;700' },
      },
      preview:
        'https://upload.wikimedia.org/wikipedia/commons/2/2a/Claude_Monet_040.jpg',
    },
    {
      color: 'green',
      score: 4240,
      title: 'Shrek by Tiffany',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#3a5948',
          'background-1': '#6c9169',
          'background-2': '#28672f',
          borders: '#0e2608',
          links: '#000000',
          sidebar: '#829d80',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/61/b6/d0/61b6d04cd2af427bfd999efa9f2f8cb6.jpg',
          'https://i.pinimg.com/564x/59/67/b4/5967b4a2b17af433f938b905aec0f666.jpg',
          'https://i.pinimg.com/originals/d4/7f/da/d47fda1760796909faee8a5a65817ad8.jpg',
          'https://i.pinimg.com/736x/9f/dc/08/9fdc08f520b2d7fbd1a5253ca084035d.jpg',
          'https://i.pinimg.com/736x/8f/53/f9/8f53f9b0719594be9b57f120506f65e7.jpg',
          'https://i.pinimg.com/564x/75/93/12/75931239541c3306807976d227b379dd.jpg',
          'https://i.pinimg.com/564x/96/19/7e/96197ed378b0bc75e0fddbb683931071.jpg',
          'https://i.pinimg.com/564x/94/3f/0e/943f0eb1d0bfbf3d97bb5e18e46c0422.jpg',
        ],
        card_colors: [
          '#d8f3dc',
          '#b7e4c7',
          '#95d5b2',
          '#74c69d',
          '#52b788',
          '#d8f3dc',
          '#b7e4c7',
          '#95d5b2',
        ],
        custom_font: { family: "'Epilogue'", link: 'Epilogue:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/59/67/b4/5967b4a2b17af433f938b905aec0f666.jpg',
    },
    {
      color: 'white',
      score: 3440,
      title: 'PurpleGalore by Armita',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '',
          'background-1': '#ccccff',
          'background-2': '#ccccff',
          borders: '#7e1094',
          links: '#9456f0',
          sidebar: '#ccccff',
          'sidebar-text': '#000000',
          'text-0': '#212121',
          'text-1': '#000000',
          'text-2': '#562e70',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/62/78/41/627841e972b509f7d14e9cc4c57def53.jpg',
          'https://64.media.tumblr.com/d4a13a446aa5e5f289e20814e0a94235/tumblr_or32x0dlHD1wp29mto1_1280.jpg',
          'https://i.pinimg.com/originals/83/14/ab/8314aba5215bca96c497c51617223fb4.jpg',
          'https://i.pinimg.com/originals/16/47/af/1647afe56b90b64be219d34ffd95ca64.jpg',
          'https://i.pinimg.com/1200x/08/c1/aa/08c1aa0989a6ef30bee937e5d408d61e.jpg',
          'https://imgc.artprintimages.com/img/print/kimberly-allen-violet-streams_u-l-q1jx2jt0.jpg?artHeight=550&artPerspective=n&artWidth=550&background=fbfbfb',
          'https://i.pinimg.com/originals/a4/25/44/a42544534444732e6647cd8eef67c4ff.jpg',
        ],
        card_colors: ['#9456f0'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://i.pinimg.com/1200x/08/c1/aa/08c1aa0989a6ef30bee937e5d408d61e.jpg',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'Cottagecore by Abby',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fdf0e3',
          'background-1': '#A29670',
          'background-2': '#52796f',
          borders: '#535231',
          links: '#24640c',
          sidebar: '#cf9e8e',
          'sidebar-text': '#e2e8de',
          'text-0': '#372601',
          'text-1': '#8b6892',
          'text-2': '#95485C',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/90/5c/f4/905cf457d93d7aae4ca16b3d9fe93a6f.jpg',
          'https://i.pinimg.com/474x/b4/38/2d/b4382de528271240204fa14e9b32c9fc.jpg',
          'https://i.pinimg.com/474x/8f/aa/ba/8faaba45e5acdcf4a8435889c117c4f8.jpg',
          'https://i.pinimg.com/474x/24/62/a6/2462a65570d76e571486370add2a12ef.jpg',
          'https://i.pinimg.com/474x/cd/f2/16/cdf216132b6062b901162865dac741ad.jpg',
        ],
        card_colors: ['#A29670'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://i.pinimg.com/474x/8f/aa/ba/8faaba45e5acdcf4a8435889c117c4f8.jpg',
    },
    {
      color: 'blue',
      score: 4430,
      title: 'blues by glenda',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#2F4156',
          'background-1': '#4366a3',
          'background-2': '#4366a3',
          borders: '#D0E3FF',
          links: '#F5EFEB',
          sidebar: 'linear-gradient(#2F4156, #334EAC)',
          'sidebar-text': '#F5EFEB',
          'text-0': '#F5EFEB',
          'text-1': '#F5EFEB',
          'text-2': '#D0E3FF',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/fd/b3/7f/fdb37fb5a61d4d336b0110292e94b6a8.jpg',
          'https://i.pinimg.com/474x/31/af/76/31af76d723e7daa6a740492ec232c4bb.jpg',
          'https://i.pinimg.com/474x/3b/37/95/3b3795859842ceb82a6987c2877898bc.jpg',
          'https://i.pinimg.com/474x/6f/4f/69/6f4f69afeda316068a478ab5b7139c4b.jpg',
          'https://i.pinimg.com/474x/72/f7/37/72f7378dad61838081908ca7306d8a16.jpg',
          'https://i.pinimg.com/474x/b3/3f/6d/b33f6d10b582da6a07b167901e380572.jpg',
          'https://i.pinimg.com/474x/73/eb/d6/73ebd6f0029d1b335e183e79aab01706.jpg',
          'https://i.pinimg.com/474x/85/9b/5d/859b5d3528c1022ba4818b91abae6276.jpg',
        ],
        card_colors: [
          '#ade8f4',
          '#90e0ef',
          '#48cae4',
          '#00b4d8',
          '#0096c7',
          '#ade8f4',
          '#90e0ef',
          '#48cae4',
        ],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://i.pinimg.com/474x/fd/b3/7f/fdb37fb5a61d4d336b0110292e94b6a8.jpg',
    },
    {
      color: 'orange',
      score: 4340,
      title: 'Fall by Elizabeth',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#FDECDE',
          'background-1': '#FB9B52',
          'background-2': '#FB9B52',
          borders: '#FB9B52',
          links: '#E8700E',
          sidebar: 'linear-gradient(#f28515, #de413d)',
          'sidebar-text': '#ffffff',
          'text-0': '#de413d',
          'text-1': '#de413d',
          'text-2': '#FB9B52',
        },
        custom_cards: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLgMtf7-u8Le0UDOIkAn6qCiTZ0uR7Q9ZT0t9YnqKriXo4kcMyC0WzuJLJE4NqKiLIkE4&usqp=CAU',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYc_cPVxhbwRINWC8MBafhra1kLifTN1jzxA&usqp=CAU',
          'https://blog.gaiagps.com/wp-content/uploads/2022/09/GettyImages-1332536405-scaled.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5o3aDyD9dCU7mkxPR4AGCJTkIAFs2sgU-PA&usqp=CAU',
        ],
        card_colors: ['#E8700E'],
        custom_font: { family: "'Cinzel'", link: 'Cinzel:wght@400;700' },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5o3aDyD9dCU7mkxPR4AGCJTkIAFs2sgU-PA&usqp=CAU',
    },
    {
      color: 'orange',
      score: 4340,
      title: 'BeeCraft by toy50',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffc370',
          'background-1': '#ffb825',
          'background-2': '#ed8c00',
          borders: '#8e4200',
          links: '#50a8b4',
          sidebar:
            'linear-gradient(#ed8c00c7, #572800c7), center url("https://i.redd.it/659qi54aksr31.png")',
          'sidebar-text': '#fff480',
          'text-0': '#000000',
          'text-1': '#6b4701',
          'text-2': '#cc5d00',
        },
        custom_cards: [
          'https://i.redd.it/7a1wug90r58b1.gif',
          'https://i.pinimg.com/originals/c3/b8/2f/c3b82f8fd712118015d74be806df38fe.gif',
          'https://shorturl.at/Hmafl',
          'https://shorturl.at/FqPa4',
        ],
        card_colors: ['#25171a', '#4b244a', '#533a7b', '#6969b3'],
        custom_font: {
          family: "'Silkscreen'",
          link: 'Silkscreen:wght@400;700',
        },
      },
      preview: 'https://i.redd.it/7a1wug90r58b1.gif',
    },
    {
      color: 'purple',
      score: 3440,
      title: 'pink&green by ella',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#21171b',
          'background-1': '#14141a',
          'background-2': '#27272a',
          borders: '#2c3f2f',
          links: '#ba6d9a',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://i.pinimg.com/736x/e8/60/41/e86041a3a7b2798230e543eda6faa8f5.jpg")',
          'sidebar-text': '#f2cae3',
          'text-0': '#8fa088',
          'text-1': '#899b7d',
          'text-2': '#dc84a3',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/27/18/dd/2718ddd1ca6c91ce32dbd029579866f5.jpg',
          'https://i.pinimg.com/originals/b7/77/77/b777779aecd8ef729798b7de4d3d31cc.jpg',
          'https://i.pinimg.com/564x/2f/e2/3f/2fe23f2ab0e08500aefb41d04d119032.jpg',
          'https://i.pinimg.com/736x/b2/c8/13/b2c8131cddc08ba69e8513bd3c88400f.jpg',
        ],
        card_colors: ['#5f8662'],
        custom_font: { family: "'Karla'", link: 'Karla:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/2f/e2/3f/2fe23f2ab0e08500aefb41d04d119032.jpg',
    },
    {
      color: 'red',
      score: 3440,
      title: 'RedFall by C',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#780000',
          'background-1': '#5f0802',
          'background-2': '#660000',
          borders: '#000000',
          links: '5a2626',
          sidebar: '#660000',
          'sidebar-text': '#ffe8d6',
          'text-0': '#ffe8d6',
          'text-1': '#ffe8d6',
          'text-2': '#ffe8d6',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/29/72/f4/2972f49f7efad8e0e446acd3fb58bf73.jpg',
          'https://i.pinimg.com/564x/97/2d/f7/972df785c3f9f1e0d9b93615d2520328.jpg',
          'https://i.pinimg.com/736x/36/b0/0b/36b00bf63da23229daab0a82be9bd7fe.jpg',
          'https://i.pinimg.com/736x/07/4f/3d/074f3d5be1ffff6400df7ad2e2e3065b.jpg',
          'https://i.pinimg.com/736x/f9/6a/6a/f96a6a6302269e92a9d345ce4c54646b.jpg',
          'https://i.pinimg.com/564x/41/ad/35/41ad357e020bd2bbc4d25049d92bc3e9.jpg',
          'https://i.pinimg.com/564x/9f/88/2a/9f882a8a54a3ecff8ed1e47598e3b92c.jpg',
          'https://i.pinimg.com/564x/f6/aa/ac/f6aaac6e5cf263e6dcc84d7c37270aed.jpg',
        ],
        card_colors: [
          '#bb3b38',
          '#370617',
          '#370617',
          '#370617',
          '#370617',
          '#370617',
        ],
        custom_font: { family: "'Rubik'", link: 'Rubik:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/736x/07/4f/3d/074f3d5be1ffff6400df7ad2e2e3065b.jpg',
    },
    {
      color: 'green',
      score: 3230,
      title: 'ErenYeager by Annie',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#519a5d',
          'background-1': '#53c182',
          'background-2': '#3a2508',
          borders: '#bfa55f',
          links: '#382b05',
          sidebar: '#1e7648',
          'sidebar-text': '#e2e8de',
          'text-0': '#3d9900',
          'text-1': '#4d1814',
          'text-2': '#94f0c0',
        },
        custom_cards: [
          'https://th.bing.com/th/id/OIP.TyG1L9AJSOoZ8lnPGPjEIAHaEK?rs=1&pid=ImgDetMain',
          'https://th.bing.com/th/id/R.f5f6505bac8d1eca4ec69b32a6a44e4a?rik=O5PTvAEW%2bMINGQ&pid=ImgRaw&r=0',
          'https://media0.giphy.com/media/zwPRprvrP4Lm0/giphy.gif',
          'https://c.tenor.com/BiQD9TmohcsAAAAC/eren-jaeger-eren.gif',
          'https://vignette.wikia.nocookie.net/835dd519-adcb-474e-a1c7-7712e16cc502/scale-to-width-down/627',
          'https://media0.giphy.com/media/3o7bugwhhJE9WhxkYw/giphy.gif',
          'https://gifdb.com/images/file/eren-yeager-founding-titan-lzufht2moff0vxb6.gif',
        ],
        card_colors: [
          '#009688',
          '#38a3a5',
          '#57cc99',
          '#80ed99',
          '#c7f9cc',
          '#009688',
          '#38a3a5',
          '#e1185c',
        ],
        custom_font: { family: "'Rubik'", link: 'Rubik:wght@400;700' },
      },
      preview:
        'https://th.bing.com/th/id/R.f5f6505bac8d1eca4ec69b32a6a44e4a?rik=O5PTvAEW%2bMINGQ&pid=ImgRaw&r=0',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'GilmoreGirls by Ayla',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e2d5c6',
          'background-1': '#f1e7e4',
          'background-2': '#312421',
          borders: '#3b3430',
          links: '#2e0a15',
          sidebar:
            'linear-gradient(#6c3e19c7, #2d2424c7), center url("https://i.pinimg.com/originals/00/52/88/005288fded5c58711aef6777ec2628e9.jpg")',
          'sidebar-text': '#d5baae',
          'text-0': '#2d130b',
          'text-1': '#231610',
          'text-2': '#302c2f',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/4f/d0/55/4fd055c65d6783ebb381a231d373d411.png',
          'https://images.pexels.com/photos/4346325/pexels-photo-4346325.jpeg?cs=srgb&dl=pexels-ioanamtc-4346325.jpg&fm=jpg',
          'https://64.media.tumblr.com/53304691ab8c0b03a15517a848875eca/9db3d534cdd6be01-66/s640x960/0983aecb18952d3bdae70275135754ed18eb3646.jpg',
          'https://i.pinimg.com/736x/2f/78/f0/2f78f04c9409ba967f4c65b79634f66b.jpg',
          'https://i.pinimg.com/736x/29/d7/70/29d7704c85c6b86c3312a63d1271a69d.jpg',
          'https://i.pinimg.com/originals/d5/0b/f7/d50bf77e6b95ca17db86c9e04c430394.jpg',
          'https://i.pinimg.com/originals/e7/ec/9b/e7ec9b1909ae280b6d2a14a35a1f8639.jpg',
        ],
        card_colors: ['#2e0a15'],
        custom_font: {
          family: "'Gideon Roman'",
          link: 'Gideon+Roman:wght@400;700',
        },
      },
      preview:
        'https://64.media.tumblr.com/53304691ab8c0b03a15517a848875eca/9db3d534cdd6be01-66/s640x960/0983aecb18952d3bdae70275135754ed18eb3646.jpg',
    },
    {
      color: 'beige',
      score: 2340,
      title: 'StressCATS by zhckxl',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f3eeea',
          'background-1': '#ebe3d5',
          'background-2': '#f3eeea',
          borders: '#776b5d',
          links: '#A67B5B',
          sidebar: 'linear-gradient(#969696c7,#000000c7)',
          'sidebar-text': '#f5f5f5',
          'text-0': '#322c2b',
          'text-1': '#322c2b',
          'text-2': '#803D3B',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/29/2b/70/292b70cd954a9f762cdbcd1af692d254.jpg',
          'https://i.pinimg.com/564x/7a/cc/be/7accbe19497c3a0a9edc46fc959f43f2.jpg',
          'https://i.pinimg.com/564x/4e/0c/ae/4e0cae916b0010f28d45943dbc05149e.jpg',
          'https://i.pinimg.com/564x/6d/12/a4/6d12a4f91fd58aec347f37d9d89262f2.jpg',
          'https://i.pinimg.com/564x/9e/51/df/9e51df85b928c52c607df9f6257592c0.jpg',
          'https://i.pinimg.com/564x/c2/36/74/c236747cd41f8a2605f8d6bfededb9ff.jpg',
          'https://i.pinimg.com/736x/05/22/91/0522916c52a9f92a59663d60b9198618.jpg',
          'https://i.pinimg.com/564x/26/ff/2e/26ff2e128064ca20dbdd8ebc3df6624d.jpg',
        ],
        card_colors: [
          '#177b63',
          '#8f3e97',
          '#06a3b7',
          '#bd3c14',
          '#0b9be3',
          '#bd3c14',
          '#694e4e',
          '#694e4e',
        ],
        custom_font: { family: "'Jost'", link: 'Jost:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/9e/51/df/9e51df85b928c52c607df9f6257592c0.jpg',
    },
    {
      color: 'beige',
      score: 4340,
      title: 'Hufflepuff by Nyx',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#c8a66a',
          'background-1': '#c2974c',
          'background-2': '#936c2a',
          borders: '#563a0b',
          links: '#ffffff',
          sidebar:
            'linear-gradient(#ead29fc7, #2b1e08c7), center url("https://i.pinimg.com/564x/fd/64/59/fd64593cb23f40a27083f91719a8f066.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#7e5316',
          'text-1': '#eedec9',
          'text-2': '#f0e1c6',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/d3/3a/9b/d33a9bcfaa8e6c5b8ead6f0353127ab6.jpg',
          'https://i.pinimg.com/564x/45/94/a0/4594a009bdc3d1d5e02db14b9990d0fd.jpg',
          'https://i.pinimg.com/564x/82/93/8a/82938ab40a8a42f6333deb767a254f22.jpg',
          'https://i.pinimg.com/474x/15/3d/91/153d9123e8a2178f949e1482b8cbe618.jpg',
          'https://i.pinimg.com/736x/80/61/01/806101fa02fa2c106b463d8f3e10becd.jpg',
          'https://i.pinimg.com/564x/0f/9e/16/0f9e16b84e47b7addcca0c99424b6bd9.jpg',
          'https://i.pinimg.com/564x/fa/36/f4/fa36f4632a4472d1c5a39ffd249b5903.jpg',
        ],
        card_colors: ['#9d7939'],
        custom_font: { family: "'Lora'", link: 'Lora:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/474x/15/3d/91/153d9123e8a2178f949e1482b8cbe618.jpg',
    },
    {
      color: 'purple',
      score: 3430,
      title: 'Puppycat by Olly',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#cec9ec',
          'background-1': '#a4bfea',
          'background-2': '#82b9e8',
          borders: '#5faee1',
          links: '#0d0d0d',
          sidebar: '#f0cfeb',
          'sidebar-text': '#ffffff',
          'text-0': '#1d2c3a',
          'text-1': '#1d2c3a',
          'text-2': '#1d2c3a',
        },
        custom_cards: [
          'https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExcG1iamV6dGxucWx4aDdtdXgwN2JrNjFjcDdmamhycHdkbHM0eWN5aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/5Tav8NHOXbWrS/giphy.webp',
          'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGgxNm1tcWoxaGE1OWdjeGc1N2t1bnhqMnA5dXB0OXoyenFscXNlZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/m7tlRnPbGbBGo/giphy.webp',
        ],
        card_colors: ['#4b7b80'],
        custom_font: {
          family: "'Silkscreen'",
          link: 'Silkscreen:wght@400;700',
        },
      },
      preview:
        'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGgxNm1tcWoxaGE1OWdjeGc1N2t1bnhqMnA5dXB0OXoyenFscXNlZyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/m7tlRnPbGbBGo/giphy.webp',
    },
    {
      color: 'purple',
      score: 3330,
      title: 'PJO by Hallie',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#dde1ee',
          'background-1': '#c0c4d3',
          'background-2': '#c0c4d3',
          borders: '#737396',
          links: '#7471d1',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://i.pinimg.com/564x/91/e1/93/91e193233aea91f0acce91d3b497c835.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#0a0a52',
          'text-1': '#24247a',
          'text-2': '#24247a',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/23/a3/ea/23a3eaf2d1fe26c6a75e2a4ef2bc54bd.jpg',
          'https://i.etsystatic.com/33086138/r/il/d2b990/3744338273/il_570xN.3744338273_8mm8.jpg',
          'https://img.wattpad.com/f348f46fcec430973dc5dddff2adb00c93d95328/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f52337432723469354879677571513d3d2d3837323633373736382e313630613634303933393636363439343139383533303235393039352e6a7067?s=fit&w=720&h=720',
          'https://64.media.tumblr.com/6fbf7c5617466607e4f8f899cd24ac0c/a3df09c28320e844-54/s1280x1920/c520f32fa28217687191e7d95bfb7bbd7cf1de5a.jpg',
          'https://img.wattpad.com/72b986822cd9578ebeff8c6c4fbebb97a0a36412/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f636141336e69727a5366586e38673d3d2d313339313637333236362e313739303136623134633933343066333331353933363932363834332e6a7067?s=fit&w=720&h=720',
          'https://qph.cf2.quoracdn.net/main-thumb-1334274700-200-xulyhepvoawazsafbhxhrihgweznfocv.jpeg',
          'https://preview.redd.it/xrhvrfwhebn71.png?auto=webp&s=15e7595431d59cb3662279c0ef37ebf62e6e6fdf',
        ],
        card_colors: [
          '#7f92b8',
          '#b56576',
          '#48cae4',
          '#7f92b8',
          '#7f92b8',
          '#7f92b8',
          '#7f92b8',
        ],
        custom_font: { family: "'Lobster'", link: 'Lobster:wght@400;700' },
      },
      preview:
        'https://qph.cf2.quoracdn.net/main-thumb-1334274700-200-xulyhepvoawazsafbhxhrihgweznfocv.jpeg',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'Cozy Fall by Hails',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f5f1d6',
          'background-1': '#a28f71',
          'background-2': '#957b56',
          borders: '#352318',
          links: '#765937',
          sidebar: '#514027',
          'sidebar-text': '#ffffff',
          'text-0': '#352318',
          'text-1': '#352318',
          'text-2': '#352318',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/fd/ff/2c/fdff2c12bdf3ab548f28452ae2911831.jpg',
          'https://i.pinimg.com/236x/b5/c5/d3/b5c5d3a5c5aaf0f880dcd63dca2e4280.jpg',
          'https://i.pinimg.com/236x/20/82/e1/2082e1de579a0350afe9e045383650b5.jpg',
          'https://i.pinimg.com/236x/90/52/b5/9052b58fc75d711619ac766f5e4e5fdc.jpg',
        ],
        card_colors: ['#bf731d'],
        custom_font: { family: "'Jost'", link: 'Jost:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/236x/20/82/e1/2082e1de579a0350afe9e045383650b5.jpg',
    },
    {
      color: 'white',
      score: 4440,
      title: 'STARGIRL by Brieley',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f3f1f3',
          'background-1': '#f3f1f3',
          'background-2': '#f3f1f3',
          borders: '#a09a98',
          links: '#a09a98',
          sidebar:
            'linear-gradient(#645e60c7, #d7cdc6c7), center url("https://i.pinimg.com/originals/bf/99/ab/bf99abe3163b0c5fa3e1072084d25c08.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#a09a98',
          'text-1': '#a09a98',
          'text-2': '#f5f4f4',
        },
        custom_cards: [
          'https://i.etsystatic.com/8500589/r/il/e353c0/3638517807/il_1588xN.3638517807_t5h2.jpg',
          'https://m.media-amazon.com/images/I/81YFr5zVVOL._AC_SX679_.jpg',
          'https://i.pinimg.com/originals/59/bc/e9/59bce91297a530c932dcaf179bc73be5.jpg',
          'https://i.pinimg.com/originals/15/f1/3f/15f13f7efc6b13a2d0464ed6a73dc222.jpg',
          'https://i.pinimg.com/736x/0f/25/f7/0f25f73ce747e6bb1ecddae4d17e6e74.jpg',
          'https://i.pinimg.com/originals/85/d9/02/85d902bc2155046de7ce19c3ff597cef.jpg',
        ],
        card_colors: ['#b3b3b2'],
        custom_font: { family: "'Anybody'", link: 'Anybody:wght@400;700' },
      },
      preview: 'https://m.media-amazon.com/images/I/81YFr5zVVOL._AC_SX679_.jpg',
    },

    {
      color: 'orange',
      score: 4430,
      title: 'Ghibli Sunset by DutchAtDawn',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffe5d6',
          'background-1': '#ffdbc7',
          'background-2': '#',
          borders: '#78497e',
          links: '#8a3d7c',
          sidebar: 'linear-gradient(#ff9861, #430179)',
          'sidebar-text': '#ffffff',
          'text-0': '#e59776',
          'text-1': '#360548',
          'text-2': '#9b5cad',
        },
        custom_cards: [
          'https://i0.wp.com/erickimphotography.com/blog/wp-content/uploads/2018/06/spirited-8-1024x551-1000x538.png?resize=1000%2C538',
          'https://w0.peakpx.com/wallpaper/796/577/HD-wallpaper-laputa-fantasy-movie-anime-castle-sky-hayao-miyazaki-thumbnail.jpg',
          'https://miro.medium.com/v2/resize:fit:809/1*zAd-h2heQC0xQyDcHshzuA.png',
          'https://cdn.openart.ai/stable_diffusion/599067aa450741c79ffe10458664b9038200bd01_2000x2000.webp',
          'https://external-preview.redd.it/TQWVFQNrgu1xS9hMHho2Ae-WBOKJsaTIVhfjgZTXbCA.jpg?width=640&crop=smart&auto=webp&s=da4987fcf9ee30f7c8400fbf7cd8c5d6df1a70ea',
        ],
        card_colors: ['#e79366', '#7c317f', '#cb7064', '#a94770', '#4f1181'],
        custom_font: {
          family: "'Patrick Hand'",
          link: 'Patrick+Hand:wght@400;700',
        },
      },
      preview:
        'https://external-preview.redd.it/TQWVFQNrgu1xS9hMHho2Ae-WBOKJsaTIVhfjgZTXbCA.jpg?width=640&crop=smart&auto=webp&s=da4987fcf9ee30f7c8400fbf7cd8c5d6df1a70ea',
    },
    {
      color: 'gray',
      score: 4340,
      title: 'LilyValley by Vanessa',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e6e6e6',
          'background-1': '#e6e6e6',
          'background-2': '#a39f9f',
          borders: '#c7cdd1',
          links: '#628d93',
          sidebar:
            'linear-gradient(#aab6c5c7, #332828c7), center url("https://i.pinimg.com/originals/8f/a6/7b/8fa67b6dced022bc21fe9948709455b3.jpg")',
          'sidebar-text': '#ebeaea',
          'text-0': '#757575',
          'text-1': '#817e80',
          'text-2': '#66686b',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/f2/a2/e9/f2a2e9d06062ba1e2dd6ef49fe2cb517.jpg',
          'https://i.pinimg.com/originals/01/40/ee/0140eeb23eb51002805428ce70050f80.jpg',
          'https://i.pinimg.com/originals/88/1d/2f/881d2fc4ad8674e9a7c2547a98c5fb28.jpg',
          'https://i.pinimg.com/originals/d8/d4/a0/d8d4a016491624e1d669eea430f497a9.jpg',
          'https://i.pinimg.com/originals/e3/58/5b/e3585bf1bb664f389c3dd8e8790fddd5.jpg',
          'https://i.pinimg.com/originals/93/fb/14/93fb144b8911da5e783fadc2ec49e45d.jpg',
          'https://i.pinimg.com/originals/f3/f7/1e/f3f71e838654583ddbbbde3153f6b7df.jpg',
        ],
        card_colors: [
          '#0076b8',
          '#4d3d4d',
          '#6b705c',
          '#626e7b',
          '#a5a58d',
          '#254284',
          '#b7b7a4',
        ],
        custom_font: { family: "'Lora'", link: 'Lora:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/01/40/ee/0140eeb23eb51002805428ce70050f80.jpg',
    },
    {
      color: 'black',
      score: 2220,
      title: 'Bayonetta by Cereza',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#030303',
          'background-1': '#682746',
          'background-2': '#950909',
          borders: '#681d3b',
          links: '#aa1313',
          sidebar: 'linear-gradient(#000000, #821212)',
          'sidebar-text': '#c5e0e2',
          'text-0': '#62def4',
          'text-1': '#bbbc76',
          'text-2': '#eb0000',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/c7/8f/fe/c78ffe3ae7e96b6cf303cf92deb88671.jpg',
          'https://i.pinimg.com/474x/1c/04/35/1c0435b5b2068f32a881b474325a4031.jpg',
          'https://i.pinimg.com/474x/0d/e7/50/0de750365423eefc5d3c276175862875.jpg',
          'https://i.pinimg.com/474x/50/5b/4a/505b4ae96123210e34694fd7bf08a15d.jpg',
          'https://gugimages.s3.us-east-2.amazonaws.com/wp-content/uploads/2016/03/22232039/bayologo21.jpg',
          'https://i.pinimg.com/564x/a5/a5/4e/a5a54e4dcabec56ad6f4ff6c004a31d5.jpg',
          'https://i.pinimg.com/originals/b9/3c/1e/b93c1ebf5761e43b4502cfbe1046218b.gif',
          'https://i.pinimg.com/564x/8c/d4/ed/8cd4ed8aebca04269e7c1b2c83e13a81.jpg',
        ],
        card_colors: [
          '#afc0ca',
          '#9baeb9',
          '#879ba8',
          '#738998',
          '#5f7787',
          '#4b6476',
          '#375265',
        ],
        custom_font: { family: "'Tektur'", link: 'Tektur:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/a5/a5/4e/a5a54e4dcabec56ad6f4ff6c004a31d5.jpg',
    },
    {
      color: 'purple',
      score: 4440,
      title: 'Pastel Kuromi by BaileyY',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f5f5f5',
          'background-1': '#ebd8f8',
          'background-2': '#373737',
          borders: '#000000',
          links: '#b395d3',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://i.pinimg.com/564x/14/b9/34/14b934114efbfd18f082c20cd29d3bad.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#b38fd1',
          'text-1': '#000000',
          'text-2': '#e979a3',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/a3/46/ca/a346caca23586cbc757eb9db878ac53c.jpg',
          'https://i.pinimg.com/564x/33/21/4c/33214cb13bf01a9b688280aece9349d4.jpg',
          'https://i.pinimg.com/564x/8b/bd/c8/8bbdc802e7da12040a30d853cf4dc575.jpg',
          'https://i.pinimg.com/564x/32/2e/23/322e239312842c46063c1fdbc98acee3.jpg',
          'https://i.pinimg.com/564x/f3/53/d5/f353d506bbeb1e958c81a6a21bc71995.jpg',
          'https://i.pinimg.com/564x/2d/5f/2c/2d5f2cb253665e62aa10877f22f4a272.jpg',
        ],
        card_colors: ['#e3d0d8', '#aea3b0', '#c3b1e1', '#827081', '#91349b'],
        custom_font: { family: "'Lobster'", link: 'Lobster:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/8b/bd/c8/8bbdc802e7da12040a30d853cf4dc575.jpg',
    },
    {
      color: 'pink',
      score: 4340,
      title: 'cyan&pink by canyon',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#b100cd',
          'background-1': '#008080',
          'background-2': '#008080',
          borders: '#00FFFF',
          links: '#00FFFF',
          sidebar: '#be2ed6',
          'sidebar-text': '#00FFFF',
          'text-0': '#00FFFF',
          'text-1': '#00FFFF',
          'text-2': '#00FFFF',
        },
        custom_cards: [
          'https://st4.depositphotos.com/3203307/29012/v/1600/depositphotos_290122246-stock-illustration-cyan-and-pink-neon-lighting.jpg',
          'https://static.vecteezy.com/system/resources/previews/003/853/666/original/glowing-neon-lighting-frame-with-cyan-and-pink-background-vector.jpg',
          'https://img.pikbest.com/ai/illus_our/20230428/ac2a938061b3dee161dc6f3ce6c45ebe.jpg!w700wp',
          'https://img.freepik.com/premium-vector/random-line-cyan-pink-glow-effect-neon-color-technology-future-background_22052-3037.jpg',
          'https://w.wallhaven.cc/full/6k/wallhaven-6k1ykw.jpg',
          'https://wallpapercave.com/wp/wp12315776.jpg',
          'https://as2.ftcdn.net/v2/jpg/03/50/84/09/1000_F_350840903_kf9nmw2t3VQNKDd04SVpdWHk32YenbFN.jpg',
          'https://images.pond5.com/cyan-and-pink-neon-abstract-footage-270418017_iconl.jpeg',
          'https://i.pinimg.com/736x/d5/06/39/d50639ec6a2a20c3909c310c70b44421.jpg',
        ],
        card_colors: [
          '#13e2f9',
          '#27c6f3',
          '#3baaee',
          '#4e8de8',
          '#6271e3',
          '#7655dd',
          '#8938d8',
          '#9d1cd2',
          '#b100cd',
        ],
        custom_font: { family: "'Rubik'", link: 'Rubik:wght@400;700' },
      },
      preview:
        'https://img.freepik.com/premium-vector/random-line-cyan-pink-glow-effect-neon-color-technology-future-background_22052-3037.jpg',
    },
    {
      color: 'blue',
      score: 2230,
      title: 'Verstappen by Evelyn Reed',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#172336',
          'background-1': '#f0a856',
          'background-2': '#a4651e',
          borders: '#454545',
          links: '#f0a856',
          sidebar: '#212845',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/b3/ab/16/b3ab166aebf0af5f798388bb4be20616.jpg',
          'https://i.pinimg.com/originals/17/8b/c0/178bc06b2634ba9656a5217bdaee835d.jpg',
          'https://i.pinimg.com/originals/a4/41/c0/a441c0c721e52adc13b60152d3b832db.jpg',
          'https://i.pinimg.com/originals/74/35/59/743559af6c46a6ceda9d9217be22bb3a.jpg',
          'https://i.pinimg.com/originals/bd/31/19/bd311955029cf2e5349fa8edc3fdc9b8.png',
          'https://i.pinimg.com/originals/ba/4e/06/ba4e06095868e3fd61ac78df049d97ce.jpg',
        ],
        card_colors: ['#3f4c73'],
        custom_font: { family: "'Poppins'", link: 'Poppins:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/74/35/59/743559af6c46a6ceda9d9217be22bb3a.jpg',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'FantasyRomance by Mack',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fffaf0',
          'background-1': '#dccfc1',
          'background-2': '#35472e',
          borders: '#b1a481',
          links: '#bbaa8b',
          sidebar: '#273522',
          'sidebar-text': '#f0e3cc',
          'text-0': '#613333',
          'text-1': '#7a705c',
          'text-2': '#774040',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/ab/24/60/ab2460996fa79904d1aed3e9f65553f7.jpg',
          'https://i.pinimg.com/736x/a2/95/b0/a295b036ceda6c11c9d29cb2a1d9abb3.jpg',
          'https://i.pinimg.com/564x/dd/bd/e8/ddbde80a4ef6e6cd36c5f66f99a2941e.jpg',
          'https://i.pinimg.com/736x/55/43/ce/5543ce3509937eba86fb19b75beb4663.jpg',
          'https://i.pinimg.com/564x/7a/aa/b8/7aaab88e5105a91f0081b6a94a0b1fb5.jpg',
        ],
        card_colors: ['#49543b', '#49543b', '#526e2e', '#68735b', '#273317'],
        custom_font: { family: "'Lora'", link: 'Lora:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/7a/aa/b8/7aaab88e5105a91f0081b6a94a0b1fb5.jpg',
    },
    {
      color: 'lightblue',
      score: 4240,
      title: 'GreysAnatomy by Saraya',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#dfebeb',
          'background-1': '#879ba6',
          'background-2': '#879ba6',
          borders: '#ffffff',
          links: '#879ba',
          sidebar: '#879ba6',
          'sidebar-text': '#fffff',
          'text-0': '#879ba',
          'text-1': '#879ba',
          'text-2': '#879ba',
        },
        custom_cards: [
          'https://ih1.redbubble.net/image.3105799790.9883/st,small,507x507-pad,600x600,f8f8f8.jpg',
          'https://ih1.redbubble.net/image.2476982820.1751/st,small,507x507-pad,600x600,f8f8f8.jpg',
          'https://ih1.redbubble.net/image.1791378243.8775/st,small,507x507-pad,600x600,f8f8f8.u2.jpg',
          'https://ih1.redbubble.net/image.4729482285.3338/st,small,507x507-pad,600x600,f8f8f8.jpg',
        ],
        card_colors: ['#a5c8cc', '#879ba6', '#879ba6', '#879ba6', '#879ba6'],
        custom_font: { family: "'Quicksand'", link: 'Quicksand:wght@400;700' },
      },
      preview:
        'https://ih1.redbubble.net/image.4729482285.3338/st,small,507x507-pad,600x600,f8f8f8.jpg',
    },
    {
      color: 'blue',
      score: 3340,
      title: 'rockyhorror by Salem',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#1f2f32',
          'background-1': '#452b5f',
          'background-2': '#605379',
          borders: '#605379',
          links: '#605379',
          sidebar:
            'linear-gradient(#8d7f9fc7, #000000c7), center url("https://i.pinimg.com/originals/3b/85/92/3b8592a6910e075a285de6234b1f4dd0.jpg")',
          'sidebar-text': '#e2e8de',
          'text-0': '#605379',
          'text-1': '#b59dbe',
          'text-2': '#aac6cb',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/2f/4c/8c/2f4c8cf324babfeb6bda3c74c56fbccf.jpg',
          'https://avontheatre.org/wp-content/uploads/2022/04/Rocky-Horror-Picture-Show.jpg',
          'https://i.pinimg.com/736x/86/b2/b4/86b2b484ce54c84f18b680e8ffbc5d27.jpg',
          'https://img.ricardostatic.ch/images/7cee1229-1dbe-4808-bbf5-8cbee44ed100/t_1000x750/the-rocky-horror-picture-show-25th-anniversary-edition',
          'https://i.pinimg.com/originals/ef/0a/47/ef0a477f272c171a29cfbd4cd56297ef.jpg',
          'https://d.newsweek.com/en/full/380243/rocky-horror-picture-show.jpg?w=1280&h=853&f=547ef7e0d4891a723e48fa1c8f571494',
          'https://i.pinimg.com/736x/ca/e7/b9/cae7b92138909634f1b9e9467acb4a77--rocky-horror-show-the-rocky-horror-picture-show.jpg',
          'https://i.pinimg.com/originals/2c/00/4a/2c004a37d0d8b340f37620b929d8e594.png',
        ],
        card_colors: [
          '#826878',
          '#000000',
          '#65499d',
          '#7e5e60',
          '#008074',
          '#7d6b64',
          '#4f3a3c',
          '#7d6b64',
        ],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/736x/ca/e7/b9/cae7b92138909634f1b9e9467acb4a77--rocky-horror-show-the-rocky-horror-picture-show.jpg',
    },
    {
      color: 'black',
      score: 4340,
      title: 'Op1um by Lola',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#000000',
          borders: '#000000',
          links: '#d9d9d9',
          sidebar: 'linear-gradient(#ffffff, #000000)',
          'sidebar-text': '#000000',
          'text-0': '#ffffff',
          'text-1': '#8f8f8f',
          'text-2': '#969696',
        },
        custom_cards: [
          'https://th.bing.com/th/id/OIP.gN83hK2rwo0neGrYBfLggAHaHV?w=188&h=186&c=7&r=0&o=5&pid=1.7',
          'https://th.bing.com/th/id/OIP.WoqTYPvy0L91QfPQ7jL-2gAAAA?w=147&h=183&c=7&r=0&o=5&pid=1.7',
          'https://i.pinimg.com/236x/ff/36/b8/ff36b84a8cf5440852c57637eed299e7.jpg',
          'https://th.bing.com/th/id/OIP.MkvvnZduL4X34-CdQndpRwHaEK?w=314&h=180&c=7&r=0&o=5&pid=1.7',
          'https://th.bing.com/th/id/OIP.Hi3ZF-oio-DM1-ABN7D5AgAAAA?w=185&h=185&c=7&r=0&o=5&pid=1.7',
          'https://i.pinimg.com/236x/75/7e/6c/757e6cc9f4c01b9ad8cafa25a776692b.jpg',
          'https://th.bing.com/th/id/OIP.HZ0OhL_IYxwkv8V0o4X6eQHaEK?w=258&h=180&c=7&r=0&o=5&pid=1.7',
          'https://i.pinimg.com/474x/c2/ac/43/c2ac434c507ad1966a543308df65902e.jpg',
          'https://i.pinimg.com/474x/23/4c/c8/234cc832a999766059b993b9049d0430.jpg',
          'https://i.pinimg.com/474x/47/93/1e/47931edcea0a750863b2d073e1614a4d.jpg',
          'https://i.pinimg.com/474x/6e/02/0d/6e020d9142f4f52e97f55b2e5fd28dd4.jpg',
          'https://i.pinimg.com/236x/c7/ea/6b/c7ea6b8a17605fec36f0b29b3eb1e537.jpg',
        ],
        card_colors: [
          '#67676e',
          '#766d71',
          '#6b646d',
          '#827081',
          '#686e7b',
          '#67676e',
          '#766d71',
          '#6b646d',
          '#827081',
          '#67676e',
        ],
        custom_font: { family: "'Cinzel'", link: 'Cinzel:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/236x/ff/36/b8/ff36b84a8cf5440852c57637eed299e7.jpg',
    },
    {
      color: 'green',
      score: 4340,
      title: 'Smiski by Gaby',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#2a4a26',
          'background-1': '#f3f9eb',
          'background-2': '#deeab3',
          borders: '#000000',
          links: '#000000',
          sidebar: 'linear-gradient(#2a4a26, #599654)',
          'sidebar-text': '#ffffff',
          'text-0': '#ffffff',
          'text-1': '#5c8d2a',
          'text-2': '#217326',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/69/ea/28/69ea286fa7f32c90c9bbd0a9aaff5d52.jpg',
          'https://i.pinimg.com/474x/41/22/d3/4122d3ac067be782510ffb7da5913f96.jpg',
          'https://i.pinimg.com/474x/76/32/cb/7632cba0676c7bb6a4d7bfb53f4cafc4.jpg',
          'https://i.pinimg.com/474x/05/92/89/059289a26961af5c57aa97024268029e.jpg',
          'https://i.pinimg.com/236x/41/ab/8e/41ab8eff7c3fd0edc86623b6aea94858.jpg',
        ],
        card_colors: [
          '#d8f3dc',
          '#b7e4c7',
          '#95d5b2',
          '#74c69d',
          '#52b788',
          '#d8f3dc',
          '#b7e4c7',
        ],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/474x/05/92/89/059289a26961af5c57aa97024268029e.jpg',
    },
    {
      color: 'blue',
      score: 4340,
      title: 'ShortnSweet by LavenderMak',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#1c3365',
          'background-1': '#1c3365',
          'background-2': '#1c3365',
          borders: '#fbf4df',
          links: '#b3ebf2',
          sidebar: 'linear-gradient(#76b5c5, #1e2b52)',
          'sidebar-text': '#fbf4df',
          'text-0': '#bdd5e7',
          'text-1': '#fbf4df',
          'text-2': '#fbf4df',
        },
        custom_cards: [
          'https://images.gmanews.tv/webpics/2024/08/sabrina-carpenter(2)_2024_08_23_14_10_41.jpg',
          'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZTNqcXp6bXh0NHEycG9xZXJ4Y25heGRzOTRkb2VlZmdlZjk0aDc0dyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/OzVFITu1w41WR2SCUL/giphy.webp',
          'https://c.tenor.com/Nx1rqHCcR48AAAAC/tenor.gif',
          'https://www.therevolverclub.com/cdn/shop/articles/shortnsweet-review-cover.jpg?v=1724683627&width=1920',
          'https://i.insider.com/66c8b6b743b5e59d16b4b825?width=700',
          'https://c.tenor.com/E_3aCfKDVjAAAAAC/tenor.gif',
          'https://c.tenor.com/72N4u7TNj44AAAAC/tenor.gif',
        ],
        card_colors: [
          '#ade8f4',
          '#90e0ef',
          '#48cae4',
          '#00b4d8',
          '#0096c7',
          '#ade8f4',
        ],
        custom_font: {
          family: "'DM Serif+Display'",
          link: 'DM+Serif+Display:wght@400;700',
        },
      },
      preview:
        'https://www.therevolverclub.com/cdn/shop/articles/shortnsweet-review-cover.jpg?v=1724683627&width=1920',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'Overgrown by angietor',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e5e6e5',
          'background-1': '#d4cece',
          'background-2': '#bababa',
          borders: '#67836d',
          links: '#394332',
          sidebar:
            'linear-gradient(#59825ec7, #59825ec7), center url("https://media3.giphy.com/media/udNanjwUiRTQAKLejo/200w.webp?cid=ecf05e47p3jcszd71o977dyywi00vm9j4z7awbh0uc7ujb6j&ep=v1_gifs_related&rid=200w.webp&ct=g")',
          'sidebar-text': '#26371a',
          'text-0': '#2a3f1c',
          'text-1': '#1d3111',
          'text-2': '#1d2d10',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/28/ad/30/28ad30dc83cba36d65b0291b1fe280ad.jpg',
          'https://i.pinimg.com/736x/b7/28/c1/b728c1f7e6cea274316784a393b7f9dd.jpg',
          'https://i.pinimg.com/564x/eb/31/a7/eb31a75c6adc28272a06a6ac8924066c.jpg',
          'https://i.pinimg.com/564x/fb/11/9c/fb119c8628a30372d22e4407f85635c1.jpg',
          'https://i.pinimg.com/564x/a3/78/7c/a3787c05ba91903036c9a1d52d4a7e7c.jpg',
          'https://i.pinimg.com/736x/f9/5b/ea/f95bea594376bf0a8c9612fea88cbb71.jpg',
          'https://i.pinimg.com/564x/b5/6f/cc/b56fccf705600f25da0ed24096aafe39.jpg',
          'https://i.pinimg.com/736x/08/50/f8/0850f88ac431f57b63335e3750ebaf0d.jpg',
        ],
        card_colors: [
          '#3e4a3d',
          '#bde0bc',
          '#a4c4a3',
          '#516150',
          '#8ca88c',
          '#718770',
          '#6c826b',
          '#1f3d23',
        ],
        custom_font: { family: "'Jost'", link: 'Jost:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/eb/31/a7/eb31a75c6adc28272a06a6ac8924066c.jpg',
    },
    {
      color: 'pink',
      score: 3430,
      title: 'Nana by j',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffdbdb',
          'background-1': '#fecdcd',
          'background-2': '#fb7e85',
          borders: '#c84653',
          links: '#0b998f',
          sidebar:
            'linear-gradient(#fb7e87c7, #f77881c7), center url("https://i.pinimg.com/474x/ef/80/dc/ef80dc048e248b1b1e6a632226116f54.jpg")',
          'sidebar-text': '#ffe0e8',
          'text-0': '#952d2d',
          'text-1': '#703e3e',
          'text-2': '#703e3e',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/82/56/e9/8256e9f3117ec276cee0a7a64dcc63b8.jpg',
          'https://media1.giphy.com/media/143obsuIUNOMjC/giphy.gif?cid=6c09b952a4ufvux6ovydbt8usckza321rsfcdyevdqvclg3x&ep=v1_gifs_search&rid=giphy.gif&ct=g',
          'https://i.pinimg.com/originals/de/3a/0e/de3a0ed491b44e5f0c656e6da35bf839.gif',
          'https://i.pinimg.com/474x/b4/36/23/b436234c8599930d9c81a0d3f7aa21f6.jpg',
          'https://i.pinimg.com/564x/cc/f3/d3/ccf3d30ff64dabe2bbd4f0208574dcda.jpg',
          'https://pa1.aminoapps.com/6473/8e63acd98fe89608ebd3a4876e1c61405c5e0b5c_hq.gif',
        ],
        card_colors: [
          '#eaac8b',
          '#e56b6f',
          '#b56576',
          '#6d597a',
          '#355070',
          '#eaac8b',
        ],
        custom_font: { family: "'Tektur'", link: 'Tektur:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/de/3a/0e/de3a0ed491b44e5f0c656e6da35bf839.gif',
    },
    {
      color: 'blue',
      score: 4440,
      title: 'HigherSelf by Sav',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0c0b2b',
          'background-1': '#004e41',
          'background-2': '#8c7fb0',
          borders: '#8260c2',
          links: '#97c204',
          sidebar:
            'linear-gradient(#605bfac7, #60c7), center url("https://i.pinimg.com/564x/dd/02/35/dd02358cfc0007c1fc1f4768a3673af3.jpg")',
          'sidebar-text': '#220568',
          'text-0': '#ffffff',
          'text-1': '#9cbecd',
          'text-2': '#ffa7e6',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/88/1b/b2/881bb2485ecc498abb4a2cb6fdc140b1.jpg',
          'https://i.pinimg.com/564x/5c/78/24/5c78248039db422b49f1d82891454cf1.jpg',
          'https://i.pinimg.com/564x/76/f3/25/76f325acb8e29961c1727f867ee8d3c3.jpg',
          'https://i.pinimg.com/564x/09/b2/27/09b2279d5af1eefbf159c6a165a1750d.jpg',
          'https://i.pinimg.com/736x/92/70/d0/9270d03c0eb9070597e4c4e6fecfca55.jpg',
          'https://i.pinimg.com/564x/38/20/b9/3820b9e9c04e3cc7588b315b7a1a4f52.jpg',
          'https://i.pinimg.com/564x/d5/e1/5c/d5e15ca86022a62e84d7ca4d1d94cb1c.jpg',
          'https://i.pinimg.com/736x/ca/39/71/ca3971fc42e2cea0355d730196457799.jpg',
        ],
        card_colors: ['#97c204'],
        custom_font: {
          family: "'Inria Sans'",
          link: 'Inria+Sans:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/38/20/b9/3820b9e9c04e3cc7588b315b7a1a4f52.jpg',
    },
    {
      color: 'purple',
      score: 2230,
      title: 'LaLaLand by Alanna',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#6624d9',
          'background-1': '#8246d5',
          'background-2': '#a468d4',
          borders: '#f6d604',
          links: '#76a7d5',
          sidebar: 'linear-gradient(#6009e1, #a468d4)',
          'sidebar-text': '#f6d604',
          'text-0': '#f6d604',
          'text-1': '#76a7d5',
          'text-2': '#76a7d5',
        },
        custom_cards: [
          'https://www.usatoday.com/gcdn/-mm-/eacbbeaed1b206b1d16eb15200f088632a9a0c28/c=0-0-4794-2708/local/-/media/2017/02/17/USATODAY/USATODAY/636229612391614539-LLL-D37-06200-1-.jpg',
          'https://static.wixstatic.com/media/fb155f_4e90017358d14f829e63bc8e71295a9d~mv2.jpg/v1/fill/w_980,h_403,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/fb155f_4e90017358d14f829e63bc8e71295a9d~mv2.jpg',
          'https://m.media-amazon.com/images/S/pv-target-images/60f3513fae8b98730ca48a142a8ecbee2fcad17b61a701053c17c1dd66181226.jpg',
          'https://www.dexerto.com/cdn-image/wp-content/uploads/2023/02/02/la-la-land-ending-1.jpg?width=1080&quality=75&format=auto',
          'https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEgyoxZY9qn_cWKoGqv1NXhbNr6RRYZcYyy-Fcgw_Yaphng5eh6uEQexUBngSxi6R5DProGG1ytAV5qU8wOdmYzwT4jCQkpnI-QQNdiXh739AJ1s5EdN2ATlkPfc9v46lzfsEnPfZlPPJFJj/s1600/ryan+gosling%252C+la+la+land.PNG',
        ],
        card_colors: ['#008400', '#d41e00', '#e3b505', '#95190c', '#610345'],
        custom_font: {
          family: "'Bebas Neue'",
          link: 'Bebas+Neue:wght@400;700',
        },
      },
      preview:
        'https://www.dexerto.com/cdn-image/wp-content/uploads/2023/02/02/la-la-land-ending-1.jpg?width=1080&quality=75&format=auto',
    },

    {
      color: 'pink',
      score: 4240,
      title: 'pinkkitty by Monika',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#eeb9d0',
          'background-1': '#000000',
          'background-2': '#000000',
          borders: '#ffffff',
          links: '#56Caf0',
          sidebar: '#eeb9d0',
          'sidebar-text': '#ffffff',
          'text-0': '#fdf9c9',
          'text-1': '#ffffff',
          'text-2': '#f5bcd8',
        },
        custom_cards: [
          'https://wallpapers.com/images/hd/pink-hello-kitty-heart-with-wings-c7i37gbye6akpu1u.jpg',
          'https://wallpapercat.com/w/full/3/f/4/299876-1920x1200-desktop-hd-hello-kitty-background-photo.jpg',
          'https://mrwallpaper.com/images/hd/blowing-a-kiss-hello-kitty-aesthetic-8x30i95zbuquofca.jpg',
          'https://w0.peakpx.com/wallpaper/468/77/HD-wallpaper-hello-kitty-pattern-hello-kitty-child-white-cat-pink-animal-thumbnail.jpg',
          'https://e0.pxfuel.com/wallpapers/163/171/desktop-wallpaper-cr-on-ig-hello-kitty-hello-kitty-iphone-hello-kitty-cute-hello-kitty-laptop.jpg',
          'https://i.pinimg.com/736x/33/af/8e/33af8edf102060f145c7a8b12042436e.jpg',
        ],
        card_colors: [
          '#f4c9ef',
          '#f6d4f2',
          '#f8dff5',
          '#fae9f8',
          '#fcf4fb',
          '#ffffff',
        ],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://mrwallpaper.com/images/hd/blowing-a-kiss-hello-kitty-aesthetic-8x30i95zbuquofca.jpg',
    },
    {
      color: 'blue',
      score: 3340,
      title: 'NatureSnoopy by Jo',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0e384e',
          'background-1': '#354f52',
          'background-2': '#52796f',
          borders: '#84a98c',
          links: '#b0b7bf',
          sidebar: '#508286',
          'sidebar-text': '#e2e8de',
          'text-0': '#b5b8ba',
          'text-1': '#cad2c5',
          'text-2': '#adb1aa',
        },
        custom_cards: [
          'https://www.icegif.com/wp-content/uploads/studio-ghibli-icegif-10.gif',
          'https://images.gr-assets.com/hostedimages/1489104577ra/22185966.gif',
          'https://64.media.tumblr.com/e68a6d408d6ebee9b342cb86125ff50d/62ffbdbee81730a1-1e/s540x810/02067e94982a609697af9de85990bca9771ab894.gifv',
          'https://64.media.tumblr.com/e10da8ce1268bac269360f9e104076b2/7a6d699257ee42e2-33/s640x960/ec96740f915d00c66af91e92f96e6445b1c9ef00.gifv',
          'https://64.media.tumblr.com/93379820878272bf6812c36802307fb8/653b44064bc59f8d-8e/s500x750/8c55d7faadaec019905e6490626a7a42b6dd103a.gif',
          'https://gifdb.com/images/high/chemistry-experiment-funny-snoopy-cartoon-4p2padmewac92cdv.gif',
        ],
        card_colors: ['#22577a', '#38a3a5', '#57cc99', '#80ed99', '#c7f9cc'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://64.media.tumblr.com/93379820878272bf6812c36802307fb8/653b44064bc59f8d-8e/s500x750/8c55d7faadaec019905e6490626a7a42b6dd103a.gif',
    },
    {
      color: 'blue',
      score: 4340,
      title: 'Aventurine by Udon',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#103c35',
          'background-1': '#6a602f',
          'background-2': '#020409',
          borders: '#919249',
          links: '#8f8332',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://preview.redd.it/what-are-aventurines-coins-tokens-v0-mo7ozklcdnvc1.png?width=256&format=png&auto=webp&s=399bd74bdda6c3b2d938b93c15a713a75bcbb155")',
          'sidebar-text': '#187263',
          'text-0': '#b4b28e',
          'text-1': '#919249',
          'text-2': '#75733e',
        },
        custom_cards: [
          'https://static1.srcdn.com/wordpress/wp-content/uploads/2024/03/honkai-star-rail-21-release-date-aventurine.jpg',
          'https://i.postimg.cc/zvjr7gkK/tumblr-7570bc3152d7e6ca01a8e75bfb7c09d9-a3de53a7-500.gif',
          'https://upload-os-bbs.hoyolab.com/upload/2024/02/28/8009863/cb06fae22efa9d6d2ab81a8fc38773ba_6743165018857737601.gif',
          'https://preview.redd.it/aventurines-trailer-has-so-many-cool-details-v0-nhv1y5i92suc1.png?width=954&format=png&auto=webp&s=dd6f2f4fd789c7ba226c7cd6e205648686cb5f1c',
          'https://64.media.tumblr.com/69b4d2c6da05978210143ed3905b9d8e/7be250831ace752f-96/s640x960/0653a186a41635c8473b3b7aef5af0ef254a1384.gifv',
          'https://media.assettype.com/afkgaming%2F2024-01%2Fb396e3d4-9eeb-4b34-990f-80af75248a56%2Fwerjwjrwr.jpg?auto=format%2Ccompress&dpr=1.0&w=1200',
          'https://assetsio.gnwcdn.com/honkai-star-rail-aventurine-kit-traces-priority.jpg?width=1200&height=1200&fit=bounds&quality=70&format=jpg&auto=webp',
          'https://static1.thegamerimages.com/wordpress/wp-content/uploads/2024/04/star-rail-aventurine-materials-2000x1000-1.jpg',
          'https://upload-os-bbs.hoyolab.com/upload/2024/04/16/109339302/a98eacf75cd9058645f8d61614d6964a_6781580525650843457.gif',
        ],
        card_colors: ['#1a5d65'],
        custom_font: { family: "'Lora'", link: 'Lora:wght@400;700' },
      },
      preview:
        'https://assetsio.gnwcdn.com/honkai-star-rail-aventurine-kit-traces-priority.jpg?width=1200&height=1200&fit=bounds&quality=70&format=jpg&auto=webp',
    },
    {
      color: 'white',
      score: 4440,
      title: 'Yotsuba by Sam',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#ffffff',
          'background-2': '#a4cea1',
          borders: '#ffffff',
          links: '#76c85f',
          sidebar: '#76c85f',
          'sidebar-text': '#ffffff',
          'text-0': '#5bad25',
          'text-1': '#7dc94a',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/04/7b/18/047b18d52a0c0422173877c0103afa26.jpg',
          'https://i.pinimg.com/564x/74/8b/df/748bdf56d73c9d9e4c0d0fdcff60e565.jpg',
          'https://i.pinimg.com/564x/88/52/e8/8852e80c9c4dde64b52c756884374f6c.jpg',
          'https://i.pinimg.com/564x/8e/bc/66/8ebc66cc66a9b794d4bbfbe387480ede.jpg',
          'https://i.pinimg.com/564x/86/68/e8/8668e8b45468050adbf2724c464ae0e0.jpg',
          'https://i.pinimg.com/564x/10/84/ca/1084cac0e1d2148b661f24bc732eac21.jpg',
          'https://i.pinimg.com/564x/f4/11/9a/f4119a1550c43aa8eec75609ad413480.jpg',
          'https://i.pinimg.com/564x/53/5f/04/535f048673209280940932f9a011f8c8.jpg',
        ],
        card_colors: [
          '#8ee679',
          '#8ee37c',
          '#8de07f',
          '#8ddd83',
          '#8cd986',
          '#8cd689',
          '#8bd38c',
          '#8bd090',
          '#8ee679',
        ],
        custom_font: { family: "'Rubik'", link: 'Rubik:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/04/7b/18/047b18d52a0c0422173877c0103afa26.jpg',
    },
    {
      color: 'white',
      score: 4440,
      title: 'svt carat by junkissed',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fffafa',
          'background-1': '#e7ecf8',
          'background-2': '#ebc6ca',
          borders: '#b3beda',
          links: '#f1c6c9',
          sidebar: 'linear-gradient(#ffdcdb, #8ca3cf)',
          'sidebar-text': '#ffffff',
          'text-0': '#404040',
          'text-1': '#b3beda',
          'text-2': '#404040',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/ff/d3/09/ffd3095a1719a5c1c15cd2acc8ad69e3.jpg',
          'https://i.pinimg.com/564x/3d/63/e7/3d63e76e00ed07df1c2a3a3b10a81f7c.jpg',
          'https://i.pinimg.com/564x/e0/0e/bf/e00ebf682303bf724b7b921aaa7649d9.jpg',
          'https://i.pinimg.com/564x/2d/fd/84/2dfd8418be3d6c86ce1ff93ffcfbc9f6.jpg',
          'https://i.pinimg.com/564x/36/ad/4f/36ad4fbe0f6feb39444fa928b7deef53.jpg',
          'https://i.pinimg.com/736x/a8/ec/07/a8ec07931261f2539c9667a236219644.jpg',
          'https://i.pinimg.com/736x/2b/a3/a3/2ba3a3cb6a2006b40335d2ec4bc23608.jpg',
        ],
        card_colors: ['#ffc8db'],
        custom_font: { family: "'Cabin'", link: 'Cabin:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/ff/d3/09/ffd3095a1719a5c1c15cd2acc8ad69e3.jpg',
    },
    {
      color: 'beige',
      score: 4330,
      title: 'YamanbaGyaru by @princesscamiwa',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fbe1d5',
          'background-1': '#0ce4e9',
          'background-2': '#fbd6bc',
          borders: '#0ce4e9',
          links: '#1bcdda',
          sidebar: '#ff4284',
          'sidebar-text': '#ffe9ad',
          'text-0': '#ff0095',
          'text-1': '#ff007b',
          'text-2': '#ff5c5c',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/b9/8b/c0/b98bc04d3b90734dedf969772ef20027.jpg',
          'https://i.pinimg.com/736x/60/9f/5c/609f5cd8a8d8cb483de71b7b1149f1af.jpg',
          'https://i.pinimg.com/474x/0a/57/61/0a576150e8f9f3047306a3c8c7b9edf9.jpg',
          'https://i.pinimg.com/474x/b8/4a/29/b84a292ebb95831c9727e352de1f8091.jpg',
          'https://i.pinimg.com/736x/55/7b/fa/557bfaf224030175be18e854477e99bd.jpg',
        ],
        card_colors: ['#13d8f9'],
        custom_font: { family: "'Comfortaa'", link: 'Comfortaa:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/474x/0a/57/61/0a576150e8f9f3047306a3c8c7b9edf9.jpg',
    },
    {
      color: 'beige',
      score: 4330,
      title: 'CoastalPink by Shiloh',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fbf4ea',
          'background-1': '#f7f2eb',
          'background-2': '#f7f2eb',
          borders: '#502a36',
          links: '#ff3385',
          sidebar: '#f4d7dc',
          'sidebar-text': '#fff6e5',
          'text-0': '#f0ccda',
          'text-1': '#331b05',
          'text-2': '#080808',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/84/20/bb/8420bbd60552b4865e68b54d01de2a2b.jpg',
          'https://i.pinimg.com/736x/fd/c3/98/fdc398dae2e4ba25b8501cda9788bb32.jpg',
          'https://i.pinimg.com/736x/a8/d1/04/a8d10400f37874ee039759e561dda32e.jpg',
        ],
        card_colors: ['#ff3385'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://i.pinimg.com/736x/84/20/bb/8420bbd60552b4865e68b54d01de2a2b.jpg',
    },
    {
      color: 'white',
      score: 4340,
      title: 'baroque by rebecca',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f5f5f5',
          'background-1': '#fafafa',
          'background-2': '#94a0000',
          borders: '#000000',
          links: '#8a0000',
          sidebar: '#353535',
          'sidebar-text': '#f5f5f5',
          'text-0': '#940000',
          'text-1': '#610000',
          'text-2': '#610000',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/6e/17/d6/6e17d6c1dbc66fed28d72f9430527e06.jpg',
          'https://i.pinimg.com/474x/90/75/38/90753871b9a2376c3195596f52ae93d8.jpg',
          'https://i.pinimg.com/474x/8b/61/b2/8b61b2d6ad32d86109b08f0047d7bc63.jpg',
          'https://i.pinimg.com/474x/99/ff/e8/99ffe84670acfe9063e898a764d9cf7c.jpg',
          'https://i.pinimg.com/474x/63/a1/85/63a1858a90800d9982f3b89dec96f810.jpg',
          'https://i.pinimg.com/474x/5e/f3/d7/5ef3d79ef082c7606abfa4435334811d.jpg',
          'https://i.pinimg.com/474x/9a/bb/40/9abb40931b80934601f0d2f930939e6b.jpg',
          'https://i.pinimg.com/474x/42/f2/63/42f2630d94e7bcb6bc7312005648c103.jpg',
          'https://i.pinimg.com/474x/65/ef/a4/65efa4b4255d584ae34772f009c2288a.jpg',
          'https://i.pinimg.com/474x/40/ee/84/40ee84eebfa6a172d0e23c3ea532bca4.jpg',
        ],
        card_colors: ['#8a0000'],
        custom_font: {
          family: "'Nanum Myeongjo'",
          link: 'Nanum+Myeongjo:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/474x/65/ef/a4/65efa4b4255d584ae34772f009c2288a.jpg',
    },
    {
      color: 'pink',
      score: 4430,
      title: 'Dental by Erika Z.',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#FFCFD8',
          'background-1': '#fdc4dc',
          'background-2': '#FFA6CA',
          borders: '#ff2990',
          links: '#ff0088',
          sidebar:
            'linear-gradient(#FFCFD8c7, #DA4F8Ec7), center url("https://garden.spoonflower.com/c/10018703/p/f/m/y9xHyI2PZA-m0QTEKWjPI3X9_5sUIQkaUJpXdtI6ad8X_6qF3661614OamKK/Tiny%20Pink%20Teeth.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#FF1695',
          'text-1': '#ff57a0',
          'text-2': '#f538b0',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/25/25/a4/2525a42d4fd72966d2d6c4b38147a127.jpg',
          'https://i.pinimg.com/736x/91/6e/15/916e155e3059433c9590d377e651ead5.jpg',
          'https://i.pinimg.com/564x/86/8a/2a/868a2a28bac409f4da4409bcee92004e.jpg',
          'https://i.pinimg.com/564x/74/7a/31/747a3118d78352ba1625b022dc66d084.jpg ',
          'https://i.pinimg.com/564x/30/d1/e7/30d1e7e2daf53913809dedc5961e6f88.jpg',
          'https://i.pinimg.com/564x/32/8f/a1/328fa1519c55b39b0dce643a4274185d.jpg',
        ],
        card_colors: ['#ff399b'],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/30/d1/e7/30d1e7e2daf53913809dedc5961e6f88.jpg',
    },
    {
      color: 'purple',
      score: 4440,
      title: 'Celestial by Claire',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#18092a',
          'background-1': '#4c188b',
          'background-2': '#35165a',
          borders: '#cab7e1',
          links: '#cab7e1',
          sidebar: '#100024',
          'sidebar-text': '#b998e2',
          'text-0': '#9a50fb',
          'text-1': '#9a50fb',
          'text-2': '#cab7e1',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/98/30/ac/9830ac31f4831d97eb47d82cc952edef.jpg',
          'https://i.pinimg.com/736x/3f/4f/5a/3f4f5a3dd93900ae8d02ae0306b9d0c3.jpg',
          'https://i.pinimg.com/736x/5e/9f/a1/5e9fa1d8b762a4923fa0c12e542812e8.jpg',
          'https://i.pinimg.com/736x/a3/07/a5/a307a57f609c9cb98b727cea5839acba.jpg',
          'https://i.pinimg.com/736x/64/14/f1/6414f10a103fc71f18578580b3f7a118.jpg',
        ],
        card_colors: ['#cab7e1'],
        custom_font: { family: "'Spectral'", link: 'Spectral:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/736x/64/14/f1/6414f10a103fc71f18578580b3f7a118.jpg',
    },
    {
      color: 'beige',
      score: 4330,
      title: 'BavarianAutumn by Kaitie',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f0ddcc',
          'background-1': '#ca5f07',
          'background-2': '#464401',
          borders: '#8e6a48',
          links: '#370101',
          sidebar: 'linear-gradient(#464401, #413a0b)',
          'sidebar-text': '#ccc4a8',
          'text-0': '#7e502a',
          'text-1': '#5a3a11',
          'text-2': '#422b0c',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/fb/5e/5c/fb5e5c1b5b07b9e63bd9f92e29bd0705.jpg',
          'https://i.pinimg.com/564x/51/bb/d4/51bbd42ea85e741f9c50a59ca58c1212.jpg',
          'https://i.pinimg.com/736x/b8/8b/2f/b88b2f7cb31ef4165adf81b36d5014c4.jpg',
          'https://i.pinimg.com/564x/47/f5/39/47f5392b7cd2a74c1edb2eb3d0f0aec5.jpg',
          'https://i.pinimg.com/564x/d8/89/81/d8898199db0c2b9471f9921cbb381a33.jpg',
        ],
        card_colors: ['#ccc4a8', '#cd630a', '#cf660b', '#464401', '#370101'],
        custom_font: { family: "'Caveat'", link: 'Caveat:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/d8/89/81/d8898199db0c2b9471f9921cbb381a33.jpg',
    },
    {
      color: 'red',
      score: 3430,
      title: 'Hualian by sickgimmick',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#311717',
          'background-1': '#1e0b0b',
          'background-2': '#9b2c2c',
          borders: '#a11e33',
          links: '#eec4c4',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://i.pinimg.com/736x/10/fc/04/10fc04ed8fdc1f7d95c27f91b11cd9fc.jpg")',
          'sidebar-text': '#8b2727',
          'text-0': '#f97676',
          'text-1': '#eec4c4',
          'text-2': '#eec4c4',
        },
        custom_cards: [
          'https://images.gr-assets.com/hostedimages/1672489660ra/33784354.gif',
          'https://64.media.tumblr.com/a9e32bbcfe0d1ebe0672607666092a0e/faab541d0968115f-26/s540x810/2e3e19e0c20a77849d94d5bdd903913500a1dc64.gifv',
          'https://64.media.tumblr.com/77db9274aafba2722175bb9b2d4a0c10/c0046a2b1adc95ae-51/s540x810/ff2f7ef609770d5d95abb3b2a4d882525f6834a1.gif',
          'https://64.media.tumblr.com/9c39b8a54831c65d36ee1e59d6dccd19/8b7f7e2140264550-5b/s540x810/9e6844500769427d9fc2d62e488bae7bd4adeae7.gif',
          'https://images.gr-assets.com/hostedimages/1694546873ra/34714167.gif',
        ],
        card_colors: [
          '#e01e37',
          '#c71f37',
          '#b21e35',
          '#a11d33',
          '#6e1423',
          '#e01e37',
        ],
        custom_font: { family: "'Kanit'", link: 'Kanit:wght@400;700' },
      },
      preview:
        'https://preview.redd.it/when-will-hualian-be-canon-v0-jgqimpra8f9c1.jpg?width=640&crop=smart&auto=webp&s=c59c293a39f4093f17c0b11fe69df910a3614916',
    },
    {
      color: 'gray',
      score: 3430,
      title: 'ScarletAcademia by Brooke Balogh',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#d6ced4',
          'background-1': '#d6ced4',
          'background-2': '',
          borders: '',
          links: '',
          sidebar: '#5a2626',
          'sidebar-text': '#d6ced4',
          'text-0': '#0f0f0f',
          'text-1': '#0f0f0f',
          'text-2': '#0f0f0f',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/36/06/0b/36060b818444ab6c6485fd4d86f4d13c.jpg',
          'https://i.pinimg.com/736x/84/f6/bb/84f6bbe9ff09ce095c4d678409bb1ab9.jpg',
          'https://i.pinimg.com/236x/5d/44/09/5d44094368c7ccf7d12ed76082241143.jpg',
          'https://i.pinimg.com/736x/36/b0/0b/36b00bf63da23229daab0a82be9bd7fe.jpg',
        ],
        card_colors: ['#bb3b38', '#008400', '#5a2626', '#5a2626', '#5a2626'],
        custom_font: { family: "'Karla'", link: 'Karla:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/736x/84/f6/bb/84f6bbe9ff09ce095c4d678409bb1ab9.jpg',
    },
    {
      color: 'white',
      score: 3440,
      title: 'CollegeCritters by Valery',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fafafa',
          'background-1': '#fafafa',
          'background-2': '#73724c',
          borders: '#d1a2a6',
          links: '#d1a2a6',
          sidebar: '#fafafa',
          'sidebar-text': '#73724c',
          'text-0': '#d1a2a6',
          'text-1': '#d1a2a6',
          'text-2': '#d1a2a6',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/74/e5/66/74e566b7938b5535d2fc61943b73fcc7.jpg',
          'https://i.pinimg.com/736x/ef/72/d2/ef72d20f49ab7bb72b12fcedd62830a8.jpg',
          'https://i.pinimg.com/736x/74/c7/3b/74c73b6bac42d6630b466d9e4a0e50c5.jpg',
        ],
        card_colors: ['#73724c'],
        custom_font: {
          family: "'Expletus Sans'",
          link: 'Expletus+Sans:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/736x/ef/72/d2/ef72d20f49ab7bb72b12fcedd62830a8.jpg',
    },
    {
      color: 'pink',
      score: 4440,
      title: 'dollette by Nora',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fff4ef',
          'background-1': '#ffe5e5',
          'background-2': '#ffe5e5',
          borders: '#d29daf',
          links: '#d29daf',
          sidebar:
            'linear-gradient(#c49c9cc7, #c49c9cc7), center url("https://i.pinimg.com/564x/c5/26/52/c526524d5d992dd5f32ce56c15115fe6.jpg")',
          'sidebar-text': '#fff4ef',
          'text-0': '#d29daf',
          'text-1': '#d29daf',
          'text-2': '#d29daf',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/ea/f7/89/eaf789b19f7031efe9286f635a29ef0e.jpg',
          'https://i.pinimg.com/564x/ab/4c/4b/ab4c4b9859bf249ea0afe27ffb580a37.jpg',
          'https://i.pinimg.com/736x/84/73/4f/84734ffd35561514d021387e5955d981.jpg',
          'https://i.pinimg.com/564x/c1/b9/d8/c1b9d88ba3d105752e5beaf09835e542.jpg',
          'https://i.pinimg.com/736x/89/19/5d/89195d9159d3d11ebea454a579aff88d.jpg',
        ],
        card_colors: ['#fcd7d7'],
        custom_font: {
          family: "'IM Fell+DW+Pica'",
          link: 'IM+Fell+DW+Pica:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/c1/b9/d8/c1b9d88ba3d105752e5beaf09835e542.jpg',
    },
    {
      color: 'blue',
      score: 3330,
      title: 'Copia by Asfere',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0C3973',
          'background-1': '#1B488A',
          'background-2': '#2E65B7',
          borders: '#699FEF',
          'text-0': '#C1D9FE',
          'text-1': '#B1C7E4',
          'text-2': '#6A7EA9',
          links: '#56Caf0',
          sidebar: '#3791D8',
          'sidebar-text': '#f5f5f5',
        },
        custom_cards: [
          'https://64.media.tumblr.com/527366985b8321358b015981c8fbc278/ef9c7e90a1a7f721-e3/s1280x1920/2ae3f7618304cf1ab00dfc40f21e16d3d7157c2e.gifv',
          'https://64.media.tumblr.com/8fffa1233eee0d141b0c3ac661d70083/67ee3b63ba774696-af/s400x600/4af1019dc82877b66fe115efb7422fd5139327c2.gifv',
          'https://64.media.tumblr.com/7dd222fa7ee2cd7dcb8982f789c1f416/5ecacfa9fec5cd3d-13/s540x810/814e29db6a35821dee31e0b81919df1ddb7db9d5.gifv',
          'https://64.media.tumblr.com/54217bc4eac8692c6eeded803b6dde52/a385ce0635959c65-46/s400x600/eedd43b6c1d1ee6c31984b86e0b2887dd9ed60d9.gifv',
          'https://64.media.tumblr.com/27251cf95decba6f77e95f97a93b5ff4/fb1633498d28ef56-a6/s400x600/2a53d434b4bcf29fb4058f7cdf8bc23076c2a94f.gifv',
          'https://64.media.tumblr.com/171f81b6e0a6d9a6c726cebf1b320165/01c4630686a90313-a6/s540x810/784d38b3c978008d32af2b4aeb50316709ca1658.gifv',
          'https://i.pinimg.com/564x/cc/f4/08/ccf408b3d4a68510795c92f123cab567.jpg',
        ],
        card_colors: ['#719af3'],
        custom_font: { link: 'Rakkas:wght@400;700', family: "'Rakkas'" },
      },
      preview:
        'https://64.media.tumblr.com/54217bc4eac8692c6eeded803b6dde52/a385ce0635959c65-46/s400x600/eedd43b6c1d1ee6c31984b86e0b2887dd9ed60d9.gifv',
    },
    {
      color: 'purple',
      score: 4440,
      title: '80sRetro by Isa S',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#382c44',
          'background-1': '#65395c',
          'background-2': '#564c7b',
          borders: '#dda74b',
          links: '#cc8533',
          sidebar: 'linear-gradient(#921ba1, #945519)',
          'sidebar-text': '#fbe5a7',
          'text-0': '#ec9dc7',
          'text-1': '#b57dc5',
          'text-2': '#c45fa9',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/48/0f/ed/480fed9dbb254120c4942b53dd6acf87.jpg',
          'https://i.pinimg.com/originals/bb/be/8d/bbbe8d060d65fd666bcc04c433b47174.jpg',
          'https://i.pinimg.com/736x/6c/08/39/6c0839fed84f5bf25ba647c1293c8990.jpg',
          'https://i.pinimg.com/736x/83/c0/cc/83c0ccfa6b1fd10f4f3c12292b8806fb.jpg',
        ],
        card_colors: ['#bd8c72', '#a27986', '#876599', '#6d52ad'],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/736x/6c/08/39/6c0839fed84f5bf25ba647c1293c8990.jpg',
    },
    {
      color: 'gray',
      score: 4340,
      title: 'rainynight by des',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#14181d',
          'background-1': '#1a2026',
          'background-2': '#212930',
          borders: '#2e3943',
          links: '#9ab5d6',
          sidebar:
            'linear-gradient(#2e3943c7, #14181dc7), center url("https://wallpapercrafter.com/th800/396699-Anime-City-Phone-Wallpaper.png")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.gifer.com/LoBm.gif',
          'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/2388c2fd-04eb-4c74-a88c-24caa2bd5f0d/dcy79k6-76b3b945-2b9b-46ba-b901-351419af73c4.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzIzODhjMmZkLTA0ZWItNGM3NC1hODhjLTI0Y2FhMmJkNWYwZFwvZGN5NzlrNi03NmIzYjk0NS0yYjliLTQ2YmEtYjkwMS0zNTE0MTlhZjczYzQuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.DX9008nvT0wyY9jzA7GaancWM8Kx8EuxrD63g7TrKT8',
          'https://media1.tenor.com/m/0uDfc8UDPVMAAAAd/anime-rain.gif',
          'https://c.tenor.com/TCuck5iIIH4AAAAC/rain-anime-rain.gif',
          'https://media.giphy.com/media/IuVFGSQZTd6TK/giphy.gif',
        ],
        card_colors: ['#e7e6f7', '#dcf5da', '#dec1cc'],
        custom_font: { family: "'Quicksand'", link: 'Quicksand:wght@400;700' },
      },
      preview: 'https://media1.tenor.com/m/0uDfc8UDPVMAAAAd/anime-rain.gif',
    },
    {
      color: 'black',
      score: 4330,
      title: 'Edgerunners by Sabrina W',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#050505',
          'background-1': '#000000',
          'background-2': '#000000',
          borders: '#ffffff',
          links: '#ffffff',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://cdn.mos.cms.futurecdn.net/xKkFJqojdSd8vJuvCLs5mU.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://64.media.tumblr.com/e85fdfc543b61f6ff07f2107a22cb2ac/a23d70ad1dea2c5c-36/s500x750/0e3379169062ae999fe26b41b79e52c55a278672.jpg',
          'https://64.media.tumblr.com/5cabfb7ffbb7f450d6363d9982695405/a23d70ad1dea2c5c-b2/s2048x3072/57c0455f050ea4cb862311a48af7e3ad6361d146.pnj',
          'https://64.media.tumblr.com/a2794efc06dc6c04c851db4ebaa29c3d/a23d70ad1dea2c5c-d3/s2048x3072/b1c7e10dc944949218215a6e56c005e24aab33cf.pnj',
          'https://64.media.tumblr.com/ed8559268fe549ace73e137c09083112/a23d70ad1dea2c5c-66/s2048x3072/61df95d72aeed8b796272ccf1df85be3259204c2.pnj',
          'https://64.media.tumblr.com/93b1c43546a58c27538876e200f70603/a23d70ad1dea2c5c-5d/s2048x3072/16490b5429b97fab88d335c29f7c02f9f581a371.pnj',
          'https://64.media.tumblr.com/328b3a74e997c42ee652090659745dff/a23d70ad1dea2c5c-3e/s2048x3072/b76bb1da38b98a7a7a701f66abebd566c30de6e0.pnj',
          'https://64.media.tumblr.com/d74d8eef54359a6bc980dcc8c5d42fb8/a23d70ad1dea2c5c-cf/s1280x1920/c8da1087e28e43c96da4a3121cec8da8feb9e915.webp',
        ],
        card_colors: ['#292929'],
        custom_font: { family: "'Orbitron'", link: 'Orbitron:wght@400;700' },
      },
      preview:
        'https://64.media.tumblr.com/e85fdfc543b61f6ff07f2107a22cb2ac/a23d70ad1dea2c5c-36/s500x750/0e3379169062ae999fe26b41b79e52c55a278672.jpg',
    },
    {
      color: 'beige',
      score: 3340,
      title: 'RainbowAcademia by Rowan',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e0daca',
          'background-1': '#614d73',
          'background-2': '#614d73',
          borders: '#371f4d',
          links: '#4a3061',
          sidebar:
            'linear-gradient(#adc7, #adc7), center url("https://i.pinimg.com/564x/12/e6/2b/12e62b0c6d40b3cca58a0032e9abc7c0.jpg")',
          'sidebar-text': '#9ca195',
          'text-0': '#4a3061',
          'text-1': '#4a3061',
          'text-2': '#4a3061',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/67/8a/04/678a0430c0f172482c3ed38efa7aa8d4.jpg',
          'https://i.pinimg.com/564x/ef/d9/0b/efd90b47d584c424e01e57304b5729c6.jpg',
          'https://i.pinimg.com/564x/e3/b0/bf/e3b0bf3c1f1539453ebc5126dea8c73e.jpg',
          'https://i.pinimg.com/564x/6c/8d/14/6c8d142b23f0710e851c5af5bbf919db.jpg',
          'https://i.pinimg.com/564x/aa/f7/a5/aaf7a55612d64277190962788a18fded.jpg',
          'https://i.pinimg.com/564x/7b/31/dd/7b31dda8f0bedc6438c114474628643f.jpg',
          'https://i.pinimg.com/564x/12/52/eb/1252ebfc931dafd536c4a95f94988852.jpg',
          'https://i.pinimg.com/736x/db/2a/88/db2a88e8679183d7007d3b8939571c09.jpg',
          'https://i.pinimg.com/736x/7d/a5/0a/7da50abe33eb7e228ec0e6d34b420913.jpg',
        ],
        card_colors: [
          '#ad63a1',
          '#ad63a1',
          '#ad6363',
          '#72ad63',
          '#6398ad',
          '#ada063',
          '#8463ad',
          '#6d63ad',
        ],
        custom_font: {
          family: "'Cormorant Upright'",
          link: 'Cormorant+Upright:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/736x/db/2a/88/db2a88e8679183d7007d3b8939571c09.jpg',
    },
    {
      color: 'blue',
      score: 3330,
      title: 'Dragoon by Thomas Sandoval',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000e1f',
          'background-1': '#1a2026',
          'background-2': '#004785',
          borders: '#0084ff',
          links: '#0099cc',
          sidebar:
            'linear-gradient(#000000c7, #004585c7), center url("https://i.pinimg.com/originals/56/28/da/5628da2fcacf9aceff231b089b016d93.jpg")',
          'sidebar-text': '#00fffb',
          'text-0': '#004785',
          'text-1': '#00fffb',
          'text-2': '#00fffb',
        },
        custom_cards: [
          'https://pbs.twimg.com/media/FpIzgoCakAMj924?format=jpg&name=large',
          'https://i.pinimg.com/564x/b1/48/89/b148896cc457c015f7d0b62fc7c498a2.jpg',
          'https://preview.redd.it/ngqjmnoim7821.png?width=1668&format=png&auto=webp&s=6afa7342499a7b8ce31f84102a1cf28bf3753eda',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0MMPosxJ9pHJ_pek2HwPyw0MVGiQT6LcffQ&s',
          'https://static.icy-veins.com/images/ffxiv/og-images/dragoon.jpg',
          'https://steamuserimages-a.akamaihd.net/ugc/785229875303328980/F013015AA48079D6D51459D78B2D80722B0E100C/?imw=5000&imh=5000&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQL98ZY5rWNj9ei1PV44dSMVzWvg3Br7ia_ag&s',
          'https://pbs.twimg.com/media/E9GfSpxWEAQ9Ml7.jpg:large',
        ],
        card_colors: ['#000000'],
        custom_font: { family: "'Cinzel'", link: 'Cinzel:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/b1/48/89/b148896cc457c015f7d0b62fc7c498a2.jpg',
    },
    {
      color: 'beige',
      score: 4340,
      title: 'Candy! by Squiggle',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffe9c2',
          'background-1': '#c2141d',
          'background-2': '#c52020',
          borders: '#cb1a1a',
          links: '#b21f15',
          sidebar:
            'linear-gradient(#f7d07ec7, #ffe08ac7), center url("https://i.pinimg.com/564x/cf/2b/66/cf2b66bea4523c53e8da5104f278d858.jpg")',
          'sidebar-text': '#e2e8de',
          'text-0': '#b30f0f',
          'text-1': '#2e9aff',
          'text-2': '#f5be47',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/b0/4e/6a/b04e6ae306bfdef2a7eb5ab618542304.jpg',
          'https://i.pinimg.com/736x/86/97/cb/8697cb6c246e7d1ab4b72245fe8ee435.jpg',
          'https://i.pinimg.com/736x/9c/8f/fb/9c8ffbe25b4be6e7d2578a881a545a49.jpg',
          'https://i.pinimg.com/564x/29/86/35/298635143cdeede645611f1df84ecd62.jpg',
          'https://i.pinimg.com/564x/ca/fe/76/cafe768eb16e08f15a71fa9fe3c0f5fb.jpg',
          'https://i.pinimg.com/736x/c3/ee/80/c3ee803f336261a86c2a937837a0b8d5.jpg',
          'https://i.pinimg.com/564x/f8/31/85/f8318537619da05afd4084ead3a92e5d.jpg',
        ],
        card_colors: ['#ffbd2e'],
        custom_font: {
          family: "'Silkscreen'",
          link: 'Silkscreen:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/736x/c3/ee/80/c3ee803f336261a86c2a937837a0b8d5.jpg',
    },

    {
      color: 'pink',
      score: 3330,
      title: 'Tsukasa by Mastergamer',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f0d1d1',
          'background-1': '#f6e5ec',
          'background-2': '#ff8ada',
          borders: '#d41672',
          links: '#ff0026',
          sidebar: '#f58484',
          'sidebar-text': '#6e0085',
          'text-0': '#912765',
          'text-1': '#f50000',
          'text-2': '#fe2a2a',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/fe/5b/79/fe5b7939cd66b3dcef2d65fc1d3a8a92.gif',
          'https://i.imgur.com/zbCwoEu.gif',
          'https://i.redd.it/people-who-dont-know-who-this-is-whats-your-first-v0-nf2s1ujdv1oc1.gif?width=640&auto=webp&s=ba45c0662161bfa530adb1384fa599dec3ddf7a4',
          'https://i.pinimg.com/originals/9f/41/f0/9f41f0bd4e9ef3181daa399d2297b6a4.gif',
          'https://i.pinimg.com/originals/95/05/7a/95057a7e1b8c7a0c2586a5933f87b332.gif',
          'https://64.media.tumblr.com/476a50f3fb5e06e655b91005500bd42a/bd7e68bd0bf7d2c2-5d/s500x750/2091430400057e3509685afc144c68a4172cc7bf.gif',
          'https://media.tenor.com/9a0CO3RNB1gAAAAM/tonikawa-tonikaku-kawaii.gif',
          'https://64.media.tumblr.com/c0efbe103fb770647a4255912511ed58/bf1e9d2ca5227ba5-60/s540x810/7fd4a3edbcf6ced4ada47d680e6d815c1d3a0acc.gif',
        ],
        card_colors: ['#000000'],
        custom_font: { family: "'Lobster'", link: 'Lobster:wght@400;700' },
      },
      preview:
        'https://media.tenor.com/9a0CO3RNB1gAAAAM/tonikawa-tonikaku-kawaii.gif',
    },
    {
      color: 'lightblue',
      score: 4330,
      title: 'Penelope by Alex V',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#d0dbe2',
          'background-1': '#f5f5f5',
          'background-2': '#d4d4d4',
          borders: '#3398db',
          links: '#407fa5',
          sidebar: '#80b9e5',
          'sidebar-text': '#ffffff',
          'text-0': '#18374e',
          'text-1': '#757070',
          'text-2': '#393737',
        },
        custom_cards: [
          'https://64.media.tumblr.com/1d948e88d2313c5061a5d8c01966b3c7/c59b98817e9178d4-c9/s540x810/010b208fa8fc73141cfedaf42bba05c9676fd615.gifv',
          'https://64.media.tumblr.com/c2a4a7b8e6ddcb4465eaf19fbd2fba04/c59b98817e9178d4-21/s540x810/08daee2034601c24432b2af4016a2b88dcaff5d9.gifv',
          'https://64.media.tumblr.com/2c351cb870220f85a8c5b28c3beb8278/c59b98817e9178d4-26/s540x810/02572ff97272056d879f0c2a27cbcf7b920766a3.gifv',
          'https://images.payhip.com/o_1hu648b6c1emf561967j3c19ag1n.gif',
          'https://media.tenor.com/e1DOvby80fkAAAAM/bridgerton-nicola-coughlan.gif',
          'https://64.media.tumblr.com/1a26f98cd95e83c7177bb79f612ce6c2/c59b98817e9178d4-50/s540x810/a2a78ce5df56445c216dbd9b921af4de8c50fb06.gifv',
        ],
        card_colors: ['#5589ce'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://media.tenor.com/e1DOvby80fkAAAAM/bridgerton-nicola-coughlan.gif',
    },
    {
      color: 'lightgreen',
      score: 4340,
      title: 'DarkForest by Mason',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#c1d1c2',
          'background-1': '',
          'background-2': '',
          borders: '#33502f',
          links: '#4d8059',
          sidebar:
            'linear-gradient(#59886dc7, #000000c7), center url("https://i.pinimg.com/736x/0f/74/1c/0f741c2e36a37f553574f588635c2e1a.jpg")',
          'sidebar-text': '#c1d1c2',
          'text-0': '#1c231b',
          'text-1': '#1c231b',
          'text-2': '#1c231b',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/a3/85/62/a38562343be89228082fb43db600d08e.jpg',
          'https://i.pinimg.com/736x/27/51/ac/2751ac17f47562030fd47e4a2c63cca7.jpg',
          'https://i.pinimg.com/736x/1d/09/53/1d095314860094178140d5bf7952f5ee.jpg',
          'https://i.pinimg.com/736x/d3/83/63/d38363c672c48fc4683897392e2469a1.jpg',
          'https://i.pinimg.com/736x/1d/b6/53/1db653b396e282c16c78e34d34e90579.jpg',
        ],
        card_colors: ['#3d251e'],
        custom_font: { family: "'Arimo'", link: 'Arimo:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/736x/1d/b6/53/1db653b396e282c16c78e34d34e90579.jpg',
    },
    {
      color: 'pink',
      score: 2230,
      title: 'SaikiK by Natalie',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fff3f9',
          'background-1': '#fff3f9',
          'background-2': '#ed3692',
          borders: '#45b896',
          links: '#ed3692',
          sidebar: 'linear-gradient(#ed3692, #47c939)',
          'sidebar-text': '#ffffff',
          'text-0': '#ed3692',
          'text-1': '#47c939',
          'text-2': '#45b896',
        },
        custom_cards: [
          'https://pa1.aminoapps.com/7504/47f59915fceeb1c81cdd0c2f83b57b35da9249a1r1-496-279_hq.gif',
          'https://media.tenor.com/P5qKPDnzBUcAAAAM/anime-saiki.gif',
          'https://64.media.tumblr.com/c8289f5bbfddc0162a0939d9b64bd243/6293e6f3933f9de2-42/s500x750/24f7427aee55e7c4ca54ffcab0a22faa9554cbd9.gifv',
          'https://i.pinimg.com/originals/d8/7a/ee/d87aeed1db5196f64dd95aad0bab5daf.gif',
        ],
        card_colors: ['#0000ff', '#3b3c3f', '#52b7a4', '#4e3236'],
        custom_font: { family: "'Rubik'", link: 'Rubik:wght@400;700' },
      },
      preview: 'https://media.tenor.com/P5qKPDnzBUcAAAAM/anime-saiki.gif',
    },
    {
      color: 'pink',
      score: 4340,
      title: 'Prettypink by Samantha',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fffafa',
          'background-1': '#fffafa',
          'background-2': '#da1d81',
          borders: '#da1d81',
          links: '#f49ac2',
          sidebar: '#da1d81',
          'sidebar-text': '#f5f5f5',
          'text-0': '#e2725b',
          'text-1': '#cb410b',
          'text-2': '#da1d81',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/5a/bd/04/5abd04cf794c1c3f7996a97aaacc5d0f.jpg',
          'https://i.pinimg.com/236x/f4/9e/a9/f49ea9ff498763add0dfd4056693de27.jpg',
          'https://i.pinimg.com/474x/3d/f3/24/3df3244ecf9d00eabe80d7940b8e73b7.jpg',
          'https://i.pinimg.com/236x/3e/33/93/3e3393f22ccf2685cab9cf130f6386ac.jpg',
          'https://i.pinimg.com/236x/51/20/d8/5120d8787e31b12db7913ecacdf2898c.jpg',
        ],
        card_colors: ['#f49ac2'],
        custom_font: { family: "'Corben'", link: 'Corben:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/236x/f4/9e/a9/f49ea9ff498763add0dfd4056693de27.jpg',
    },
    {
      color: 'white',
      score: 4430,
      title: 'Jellyfish by Eva',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffffff',
          'background-1': '#ffffff',
          'background-2': '#ffffff',
          borders: '#cccccc',
          links: '#cccccc',
          sidebar: '#ffffff',
          'sidebar-text': '#cccccc',
          'text-0': '#888686',
          'text-1': '#b0b0b0',
          'text-2': '#cccccc',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/3c/8f/31/3c8f318aaabf4474a3690a01c53a9713.jpg',
          'https://i.pinimg.com/564x/6b/66/a2/6b66a2328a93fcb3b8abd33a22aa3e06.jpg',
          'https://i.pinimg.com/564x/ef/2f/3d/ef2f3d5da6482adfc5ce255ba11f94fe.jpg',
          'https://i.pinimg.com/736x/b5/05/a2/b505a2cdf072a4dce8dc4469d4d68677.jpg',
          'https://i.pinimg.com/564x/de/5c/6c/de5c6c53571aad05b0439695dc233365.jpg',
          'https://i.pinimg.com/564x/43/37/8d/43378d06b551efb9af08b4f25bf9bd18.jpg',
        ],
        card_colors: [
          '#e7e6f7',
          '#e3d0d8',
          '#aea3b0',
          '#827081',
          '#c6d2ed',
          '#e7e6f7',
        ],
        custom_font: { family: "'Lora'", link: 'Lora:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/6b/66/a2/6b66a2328a93fcb3b8abd33a22aa3e06.jpg',
    },
    {
      color: 'black',
      score: 2430,
      title: 'MCR  by Weirdsnail',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#090505',
          'background-1': '#380404',
          'background-2': '#4b2020',
          borders: '#721010',
          links: '#721010',
          sidebar: '#4b2020',
          'sidebar-text': '#635353',
          'text-0': '#721010',
          'text-1': '#635353',
          'text-2': '#635353',
        },
        custom_cards: [
          'https://m.media-amazon.com/images/I/81fNQtNDw8L._UF1000,1000_QL80_.jpg',
          'https://live.staticflickr.com/3646/3331997467_d78a6aa120_n.jpg',
          'https://art.pixilart.com/05646ecdb690561.png',
          'https://live.staticflickr.com/3745/10840814766_485410aef9_h.jpg',
          'https://lastfm.freetls.fastly.net/i/u/ar0/44609c7dbca1bd44981c46785636f97e.jpg',
          'https://www.rollingstone.com/wp-content/uploads/2021/10/GettyImages-171400889.jpg?w=1581&h=1054&crop=1',
          'https://m.media-amazon.com/images/I/81aECQlJWwL._UF1000,1000_QL80_.jpg',
        ],
        card_colors: [
          '#e01e37',
          '#c71f37',
          '#b21e35',
          '#a11d33',
          '#6e1423',
          '#e01e37',
          '#c71f37',
        ],
        custom_font: {
          family: "'Silkscreen'",
          link: 'Silkscreen:wght@400;700',
        },
      },
      preview: 'https://art.pixilart.com/05646ecdb690561.png',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'YellowFairies by Jamie',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e3dbc0',
          'background-1': '#7d652a',
          'background-2': '#c5ac30',
          borders: '#7d8137',
          links: '#7d652a',
          sidebar:
            'linear-gradient(#ccb435c7, #564724c7), center url("https://i.pinimg.com/564x/85/2f/e4/852fe49b2d57af9635a090b82c0ebfee.jpg")',
          'sidebar-text': '#e3dbc0',
          'text-0': '#ccb435',
          'text-1': '#cf9526',
          'text-2': '#cf9526',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/2a/2e/c1/2a2ec17f4921b30b9084c5794be5e3f0.jpg',
          'https://i.pinimg.com/564x/b7/41/cc/b741cc4235a18762a1000114e43c2c19.jpg',
          'https://i.pinimg.com/564x/ae/58/68/ae5868f0f688af55618982e55de04cdf.jpg',
          'https://i.pinimg.com/564x/92/b9/12/92b91255123db54b9f2d3880803c973c.jpg',
          'https://i.pinimg.com/564x/d0/f1/b6/d0f1b68fd0436243b23f1944d35bd013.jpg',
          'https://i.pinimg.com/564x/53/0e/bc/530ebc9be2cd732170899819259a47c5.jpg',
          'https://i.pinimg.com/564x/86/c7/2d/86c72d2fc58c5603c7ebc3b0e14d7e93.jpg',
          'https://i.pinimg.com/736x/04/00/0a/04000a1a913ed9a4ae209832ab2f7314.jpg',
          'https://i.pinimg.com/736x/6d/da/0d/6dda0da57169c91332e8c708c6451639.jpg',
          'https://i.pinimg.com/736x/0c/56/3e/0c563e97ba4cd7171ad2657bcdf1aef4.jpg',
          'https://i.pinimg.com/736x/57/88/f2/5788f2f0cf4e273363a8d34bc916101c.jpg',
          'https://i.pinimg.com/564x/60/94/7d/60947de1cb114e5aed5ba9801afe8798.jpg',
          'https://i.pinimg.com/564x/bd/5e/c4/bd5ec4d291a953a5ec8aa115d0070268.jpg',
        ],
        card_colors: [
          '#e0b037',
          '#d8ab38',
          '#d0a639',
          '#c8a13a',
          '#c09d3b',
          '#b8983c',
          '#b0933e',
          '#a88e3f',
          '#a08a40',
          '#988541',
          '#908042',
          '#887b43',
          '#807745',
        ],
        custom_font: {
          family: "'Nanum Myeongjo'",
          link: 'Nanum+Myeongjo:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/736x/0c/56/3e/0c563e97ba4cd7171ad2657bcdf1aef4.jpg',
    },
    {
      color: 'purple',
      score: 3430,
      title: 'Rin&Len by Aki',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#3b16a2',
          'background-1': '#ffd505',
          'background-2': '#ffea00',
          borders: '#ffbe0a',
          links: '#5900ff',
          sidebar:
            'linear-gradient(#dbbe00c7, #6f7c0ec7), center url("https://wallsneedlove.com/cdn/shop/products/w0275_1s_Velvet-Bananas-Removable-Peel-and-Stick-Wallpaper_Repeating-Pattern-Sample-2.jpg?v=1604091425")',
          'sidebar-text': '#f8f135',
          'text-0': '#ffbb00',
          'text-1': '#ffdd00',
          'text-2': '#ff7b00',
        },
        custom_cards: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTXrsZzjgIOo-vEVYxXP5QJC1n-FIoMxwDwg&s',
          'https://i.pinimg.com/474x/8c/67/0e/8c670e09ad1a7c4c4b58e6ced8022258.jpg',
          'https://i.pinimg.com/736x/48/65/e4/4865e4ef738f5e324495952aa6f039f6.jpg',
          'https://i.pinimg.com/474x/f0/77/e5/f077e56a0f0d7b32e227977ba41bdc4e.jpg',
          'https://i.pinimg.com/474x/3e/f2/ea/3ef2ea05c42119839b8c36022288c579.jpg',
          'https://i.pinimg.com/474x/e3/66/ab/e366abf3205cda427696097759f48822.jpg',
          'https://i.pinimg.com/474x/11/3d/57/113d5729c03b937cc0db6c11644d529f.jpg',
          'https://i.pinimg.com/474x/87/c9/6d/87c96d2728d75870af706b53e6090391.jpg',
          'https://i.pinimg.com/474x/1e/60/3d/1e603dc9a94f3493acd1844f2ad2b5fa.jpg',
          'https://i.pinimg.com/474x/15/c6/ad/15c6ada8feaef0152a936b42140d84e2.jpg',
          'https://i.pinimg.com/474x/4f/67/eb/4f67eb36e32736b9adaffe127a592e42.jpg',
          'https://i.ytimg.com/vi/hFz8iA-DTI4/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGGQgUChlMA8=&rs=AOn4CLB5TEul2UtmWrFaSAF0XDld5I7MJQ',
          'https://i.pinimg.com/originals/f4/54/89/f45489e466c8f30e66c271e62f9b11d7.jpg',
          'https://images4.alphacoders.com/129/1295792.png',
          'https://images.saymedia-content.com/.image/ar_16:9%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cq_auto:eco%2Cw_1200/MTc2MjcyODQ4NjYxNzE4MjA2/my-top-10-favorite-kagamine-rinlen-duet-songs.jpg',
        ],
        card_colors: ['#5900ff'],
        custom_font: {
          family: "'Silkscreen'",
          link: 'Silkscreen:wght@400;700',
        },
      },
      preview:
        'https://i.ytimg.com/vi/hFz8iA-DTI4/hq720.jpg?sqp=-oaymwE7CK4FEIIDSFryq4qpAy0IARUAAAAAGAElAADIQj0AgKJD8AEB-AH-CYAC0AWKAgwIABABGGQgUChlMA8=&rs=AOn4CLB5TEul2UtmWrFaSAF0XDld5I7MJQ',
    },
    {
      color: 'orange',
      score: 4340,
      title: 'Autumn by Emma',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#934221',
          'background-1': '#4c2b08',
          'background-2': '#d45b12',
          borders: '#4c2b08',
          links: '#000000',
          sidebar: '#4c2b08',
          'sidebar-text': '#d45b12',
          'text-0': '#341a09',
          'text-1': '#32170f',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/69/e8/43/69e843e0c85daa1abaefd7a3cf057dc9.gif',
          'https://i.pinimg.com/originals/5e/9f/b6/5e9fb6d22ba25824fe1f2e993d801ee4.gif',
          'https://i.pinimg.com/originals/99/a8/68/99a868701dbdc51c04fa07ced962832a.gif',
          'https://i.pinimg.com/originals/bd/6f/4d/bd6f4d59839a8241c20863021b9477a9.gif',
          'https://i.pinimg.com/originals/95/d0/6e/95d06ee0ac5a1bbc810ae3994dc85b81.gif',
        ],
        card_colors: ['#ff9505'],
        custom_font: { family: "'Open Sans'", link: 'Open+Sans:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/bd/6f/4d/bd6f4d59839a8241c20863021b9477a9.gif',
    },
    {
      color: 'brown',
      score: 3330,
      title: 'Limbus by Anonymous',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#190a0a',
          'background-1': '#311717',
          'background-2': '#feda58',
          borders: '#360707',
          links: '#feda58',
          sidebar:
            'linear-gradient(#190a0ac7, #2c2611c7), center url("https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/1973530/capsule_616x353.jpg?t=1711352565")',
          'sidebar-text': '#ffffff',
          'text-0': '#6e6a59',
          'text-1': '#feda58',
          'text-2': '#360707',
        },
        custom_cards: [
          'https://limbuscompany.wiki.gg/images/8/80/Chapter2_Pre.png',
          'https://limbuscompany.wiki.gg/images/9/96/Chapter3.png',
          'https://limbuscompany.wiki.gg/images/9/91/Chapter1_Begin.png',
          'https://limbuscompany.wiki.gg/images/7/77/Chapter4_Begin.png',
          'https://limbuscompany.wiki.gg/images/1/14/Chapter5_Mid.png',
          'https://limbuscompany.wiki.gg/images/e/e6/Chapter6_Pre.png',
        ],
        card_colors: ['#feda58'],
        custom_font: { family: "'Rowdies'", link: 'Rowdies:wght@400;700' },
      },
      preview: 'https://limbuscompany.wiki.gg/images/9/91/Chapter1_Begin.png',
    },
    {
      color: 'lightgreen',
      score: 4340,
      title: 'GreenAesthetic  by EmmaBoBemma',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f0f4eb',
          'background-1': '#899975',
          'background-2': '#7c886d',
          borders: '#6f7e5d',
          links: '#b3d7b2',
          sidebar: '#899778',
          'sidebar-text': '#ffffff',
          'text-0': '#3c4332',
          'text-1': '#3c4332',
          'text-2': '#3c4332',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/b3/53/9a/b3539aac1f5da45314667f27ffa450cd.jpg',
          'https://i.pinimg.com/originals/71/8b/0c/718b0c17a7b538d38c67dda688d42d10.jpg',
          'https://i.pinimg.com/originals/33/76/33/3376334566a80f2003e75da6ffe7e951.jpg',
          'https://i.pinimg.com/originals/bc/a2/d2/bca2d281917aa87ccfb06bd766e9b095.jpg',
        ],
        card_colors: ['#485441', '#546650', '#61775f', '#6d896e', '#799a7d'],
        custom_font: {
          family: "'Inconsolata'",
          link: 'Inconsolata:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/originals/b3/53/9a/b3539aac1f5da45314667f27ffa450cd.jpg',
    },
    {
      color: 'brown',
      score: 4430,
      title: 'RED by anonymous',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#907763',
          'background-1': '#440201',
          'background-2': '#B2BEB4',
          borders: '#2E2714',
          links: '#651D01',
          sidebar: '#440201',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/de/57/f7/de57f7d5593ff51c9d343df06d5fcb6c.jpg',
          'https://i.pinimg.com/564x/33/13/98/331398cfd714ecf72d9517c70958be1c.jpg',
        ],
        card_colors: ['#75270d', '#ebe7db'],
        custom_font: { family: "'tungsten'", link: 'tungsten:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/33/13/98/331398cfd714ecf72d9517c70958be1c.jpg',
    },
    {
      color: 'white',
      score: 4340,
      title: 'idiotdrawings by izzy',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fffcfa',
          'background-1': '#ffffff',
          'background-2': '#e0b8b3',
          borders: '#ffcbc4',
          links: '#7fab7a',
          sidebar:
            'linear-gradient(#ffcbc4c7, #e1ffc4c7), center url("https://i.pinimg.com/474x/a4/67/93/a46793dc3b726cad27e534463c82e9f5.jpg")',
          'sidebar-text': '#725635',
          'text-0': '#725635',
          'text-1': '#725635',
          'text-2': '#725635',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/59/d5/9c/59d59cd417fdcf231cb62203928f6408.jpg',
          'https://i.pinimg.com/474x/93/a6/dc/93a6dce55ca8d24b1e72a10c93cc686b.jpg',
          'https://i.pinimg.com/474x/a7/d2/66/a7d266d34f3a24eac426c27ab6214e7c.jpg',
          'https://i.pinimg.com/474x/e7/ca/21/e7ca219ff1ba45b4509e4fb217eb2435.jpg',
          'https://i.pinimg.com/474x/e0/1e/f6/e01ef607874432ee7a5e7f6f67a8d8a3.jpg',
          'https://i.pinimg.com/474x/b3/a3/1a/b3a31a5b00afde457a9a603ae6c8c5d7.jpg',
        ],
        card_colors: ['#ffcbc4'],
        custom_font: { family: "'Quicksand'", link: 'Quicksand:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/474x/e7/ca/21/e7ca219ff1ba45b4509e4fb217eb2435.jpg',
    },
    {
      color: 'gray',
      score: 4340,
      title: 'Team7 by Myo312',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#505251',
          'background-1': '#B06500',
          'background-2': '#383938',
          borders: '#383938',
          links: '#EA9828',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://i.pinimg.com/564x/5a/24/ae/5a24ae47e295ab1858ba6e88fa77d881.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#e2e2e2',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/b9/ae/cf/b9aecf305d0f1f3f262d0f0983186320.jpg',
          'https://i.pinimg.com/564x/af/d7/39/afd7392677b70e55bb3a545a4b2d25d5.jpg',
          'https://i.pinimg.com/564x/e0/9a/fa/e09afae4b817fe43ad2f562492cbb40b.jpg',
          'https://i.pinimg.com/564x/84/a7/3e/84a73eafdb11190c1ea46d8ce3dad52b.jpg',
          'https://i.pinimg.com/564x/a4/6f/36/a46f367d1aa1419cbc0cf4195df73e16.jpg',
          'https://i.pinimg.com/564x/83/02/8b/83028b4e55568f32d268a2dd7fd16315.jpg',
        ],
        card_colors: ['#EA9828'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://i.pinimg.com/564x/84/a7/3e/84a73eafdb11190c1ea46d8ce3dad52b.jpg',
    },
    {
      color: 'blue',
      score: 4440,
      title: 'yourname by ace',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#101a2d',
          'background-1': '#32568b',
          'background-2': '#5492e9',
          borders: '#736fff',
          links: '#8b70ff',
          sidebar: 'linear-gradient(#101a2d, #32568b)',
          'sidebar-text': '#dae3e5',
          'text-0': '#8b70ff',
          'text-1': '#beaaf2',
          'text-2': '#dae3e5',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/cc/77/c7/cc77c73075e343563d4b1736a7fb8fe9.gif',
          'https://i.pinimg.com/originals/de/32/ca/de32ca0df25cf408343ece399e5aceed.gif',
          'https://i.pinimg.com/originals/0e/73/17/0e731764c019a7965e5574bf70946e06.gif',
          'https://giffiles.alphacoders.com/262/26205.gif',
        ],
        card_colors: ['#d7dee5', '#d5dae6', '#d3d6e7'],
        custom_font: { family: "'Rubik'", link: 'Rubik:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/de/32/ca/de32ca0df25cf408343ece399e5aceed.gif',
    },
    {
      color: 'blue',
      score: 0,
      title: 'Bears by Alexander',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0B162A',
          'background-1': '#C83803',
          'background-2': '#FFFFFF',
          borders: '#C83803',
          links: '#C83803',
          sidebar: 'linear-gradient(#C83803c7, #0B162Ac7), center url("")',
          'sidebar-text': '#FFFFFF',
          'text-0': '#FFFFFF',
          'text-1': '#FFFFFF',
          'text-2': '#FFFFFF',
        },
        custom_cards: [
          'https://a3.espncdn.com/combiner/i?img=%2Fphoto%2F2023%2F0812%2Fr1209879_1024x576_16%2D9.jpg&sharp=1&contrast=1.2',
          'https://cst.brightspotcdn.com/dims4/default/4934a76/2147483647/strip/true/crop/4896x3264+0+0/resize/840x560!/quality/90/?url=https%3A%2F%2Fchorus-production-cst-web.s3.us-east-1.amazonaws.com%2Fbrightspot%2Fad%2F90%2Fedc79bf84237a4f903cbb27da6ff%2Frome-odunze-picture.jpg',
          'https://cst.brightspotcdn.com/dims4/default/8704a9d/2147483647/strip/false/crop/4000x2667+0+0/resize/1486x991!/quality/90/?url=https%3A%2F%2Fcdn.vox-cdn.com%2Fthumbor%2Fq26bDhc29nBYNMyRb14pkxYlZ0Q%3D%2F0x0%3A4000x2667%2F4000x2667%2Ffilters%3Afocal%281868x585%3A1869x586%29%2Fcdn.vox-cdn.com%2Fuploads%2Fchorus_asset%2Ffile%2F23521617%2Fjohnson_jaylon__8_.jpg&sharp=1&contrast=1.2',
          'https://static.clubs.nfl.com/image/upload/t_landscape_tablet/bears/wekc81hrpjqmh9kx7trm.png',
          'https://www.chicagotribune.com/wp-content/uploads/2024/08/CTC-L-WIEDERER-BEARS-0811_fe7daa.jpg?w=525&sharp=1&contrast=1.2',
        ],
        card_colors: ['#c83803'],
        custom_font: { family: "'Tektur'", link: 'Tektur:wght@400;700' },
      },
      preview:
        'https://cst.brightspotcdn.com/dims4/default/4934a76/2147483647/strip/true/crop/4896x3264+0+0/resize/840x560!/quality/90/?url=https%3A%2F%2Fchorus-production-cst-web.s3.us-east-1.amazonaws.com%2Fbrightspot%2Fad%2F90%2Fedc79bf84237a4f903cbb27da6ff%2Frome-odunze-picture.jpg',
    },

    {
      color: 'lightblue',
      score: 3440,
      title: 'BlueDessert by chaos',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#c2e8ff',
          'background-1': 'c2e8ff',
          'background-2': 'c2e8ff',
          borders: 'c2e8ff',
          links: '#5b88a4',
          sidebar: 'linear-gradient(#c2eff8, #bdcaff)',
          'sidebar-text': '#000000',
          'text-0': '#003557',
          'text-1': '#003557',
          'text-2': '#000000',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/81/d9/70/81d9707ebfb8a6f9c3fdf13196160e7d.jpg',
          'https://i.pinimg.com/736x/d6/98/25/d69825b074660b050b59f3736ecb31c4.jpg',
          'https://i.pinimg.com/736x/03/93/dc/0393dcce1883f0a721bcaeb4c9e6a6a1.jpg',
          'https://i.pinimg.com/736x/61/0b/1a/610b1abfd43d5c486a22a5be53c5d210.jpg',
          'https://i.pinimg.com/736x/82/84/30/828430d189a6e6a6687b1f9ee088db29.jpg',
          'https://i.pinimg.com/736x/7a/73/26/7a7326be053dd554fbb063fbc372bae1.jpg',
        ],
        card_colors: ['#5b88a4'],
        custom_font: {
          family: "'Playfair Display'",
          link: 'Playfair+Display:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/736x/03/93/dc/0393dcce1883f0a721bcaeb4c9e6a6a1.jpg',
    },
    {
      color: 'lightblue',
      score: 3230,
      title: 'radicaloptimism by luis',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#d5e7eb',
          'background-1': '#47c5d7',
          'background-2': '#dec3b0',
          borders: '#c34042',
          links: '#dec3b0',
          sidebar: '#47c5d7',
          'sidebar-text': '#c34042',
          'text-0': '#c34042',
          'text-1': '#c34042',
          'text-2': '#c34042',
        },
        custom_cards: [
          'https://i.scdn.co/image/ab67616d0000b2735f530395ba026f49363c6d11',
          'https://usshop.dualipa.com/cdn/shop/files/SHARKFLOATIE1.jpg?v=1715362488',
          'https://pbs.twimg.com/media/GLMS77hWQAAF7nS?format=jpg&name=large',
          'https://pbs.twimg.com/media/GLh5QpIW0AAc5Bo?format=jpg&name=medium',
          'https://pbs.twimg.com/media/GKalnOjXMAAaVdZ?format=jpg&name=medium',
          'https://upload.wikimedia.org/wikipedia/en/f/fa/Dua_Lipa_-_Radical_Optimism.png',
        ],
        card_colors: ['#47c5d7'],
        custom_font: { family: "'DM Sans'", link: 'DM+Sans:wght@400;700' },
      },
      preview:
        'https://upload.wikimedia.org/wikipedia/en/f/fa/Dua_Lipa_-_Radical_Optimism.png',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'GhostCity by ghostrat',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fbfae9',
          'background-1': '#ddd1c0',
          'background-2': '#000000',
          borders: '#000000',
          links: '#8a0000',
          sidebar: 'linear-gradient(#5f0707, #0a0000)',
          'sidebar-text': '#fbfae9',
          'text-0': '#000000',
          'text-1': '#000000',
          'text-2': '#6d1212',
        },
        custom_cards: [
          'https://pbs.twimg.com/media/FIpAO52VUAMhgtw.jpg',
          'https://i.pinimg.com/736x/64/78/9f/64789f0ab513f1cbccb8d4e3d8b281d3.jpg',
          'https://i.redd.it/rrq6nj5kh0z81.jpg',
          'https://64.media.tumblr.com/0e6ddb6b861d6a958c6753db55b2c3c7/5615ced81256fc11-c8/s1280x1920/74fc4e81f165cda8b5152b97cacdda5aaae4c305.jpg',
        ],
        card_colors: ['#e01e37', '#c71f37', '#b21e35', '#a11d33', '#6e1423'],
        custom_font: { family: "'Lora'", link: 'Lora:wght@400;700' },
      },
      preview:
        'https://64.media.tumblr.com/0e6ddb6b861d6a958c6753db55b2c3c7/5615ced81256fc11-c8/s1280x1920/74fc4e81f165cda8b5152b97cacdda5aaae4c305.jpg',
    },
    {
      color: 'beige',
      score: 4440,
      title: 'GravityFalls by Steven',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e2dbd5',
          'background-1': '#bbada0',
          'background-2': '#806d60',
          borders: '#806d60',
          links: '#518565',
          sidebar: '#7e553e',
          'sidebar-text': '#f5f5f5',
          'text-0': '#292929',
          'text-1': '#292929',
          'text-2': '#5c5c5c',
        },
        custom_cards: [
          'https://cdna.artstation.com/p/assets/images/images/050/464/760/4k/ian-worrel-vista-sunset.jpg?1654897080',
          'https://cdna.artstation.com/p/assets/images/images/050/464/302/4k/ian-worrel-attic-lantern.jpg?1654895849',
          'https://i.pinimg.com/originals/1e/46/29/1e4629383a0b27f7477071215c47cc6f.jpg',
          'https://i.pinimg.com/originals/ab/94/e8/ab94e82e832514424273e65f6386fbda.jpg',
          'https://i.pinimg.com/originals/3e/57/fe/3e57fe44e11309bd9b158399bbb38ab9.png',
        ],
        card_colors: ['#626e7b', '#ee9b00', '#8cb369', '#664147', '#1b4332'],
        custom_font: { family: "'Rubik'", link: 'Rubik:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/1e/46/29/1e4629383a0b27f7477071215c47cc6f.jpg',
    },
    {
      color: 'blue',
      score: 3430,
      title: 'oceanbreeze by Larisa',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#0a95a4',
          'background-1': '#00C1FF',
          'background-2': '#11cfe4',
          borders: '#94ffa9',
          links: '#7adeff',
          sidebar:
            'linear-gradient(#80f2ffc7, #0ae7ffc7), center url("https://i.pinimg.com/originals/7f/f1/e3/7ff1e39e1032fcf9347fa791abbb0a3e.jpg")',
          'sidebar-text': '#295657',
          'text-0': '#32a7a9',
          'text-1': '#56c6c8',
          'text-2': '#122640',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/3d/c2/91/3dc291fdbc9e90a29b2595bb2301e80d.jpg',
          'https://i.pinimg.com/originals/e8/2b/87/e82b875ba124060469d17deb559e1cbb.jpg',
          'https://i.pinimg.com/originals/04/66/a7/0466a7e9d3fa10a8a0552762bb80a308.jpg',
          'https://i.pinimg.com/originals/38/0f/d9/380fd969acb2f4af0f75aa02cf0b73b5.jpg',
          'https://i.pinimg.com/originals/7e/7c/53/7e7c5309a96023c8fb904fc1294a7a89.png',
        ],
        card_colors: ['#7adeff'],
        custom_font: { family: "'Rubik'", link: 'Rubik:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/7e/7c/53/7e7c5309a96023c8fb904fc1294a7a89.png',
    },
    {
      color: 'gray',
      score: 4340,
      title: 'nana by yejinurmom',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#161616',
          'background-1': '#000000',
          'background-2': '#121212',
          borders: '#5a1111',
          links: '#ededed',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://i.pinimg.com/564x/d8/c6/7f/d8c67f97118d6e3bbd9dd2a2e493e688.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#878787',
          'text-1': '#ffffff',
          'text-2': '#979595',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/d8/c6/7f/d8c67f97118d6e3bbd9dd2a2e493e688.jpg',
          'https://i.pinimg.com/564x/07/c5/81/07c581a1caaf12673aa295b1b33a7492.jpg',
          'https://i.pinimg.com/736x/c4/98/24/c49824aab8f7546618d6401a4a31788a.jpg',
          'https://i.pinimg.com/564x/54/2c/06/542c06e4d3422388fb7189ec5da88806.jpg',
        ],
        card_colors: ['#e7e6f7', '#e3d0d8', '#aea3b0', '#827081'],
        custom_font: { family: "'Fraunces'", link: 'Fraunces:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/07/c5/81/07c581a1caaf12673aa295b1b33a7492.jpg',
    },
    {
      color: 'gray',
      score: 4330,
      title: 'AirForce by Weston',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#5b5b5d',
          'background-1': '#5b5b5d',
          'background-2': '#5b5b5d',
          borders: '#000000',
          links: '#0a23a4',
          sidebar: 'linear-gradient(#5b5b5d, #021769)',
          'sidebar-text': '#ffffff',
          'text-0': '#0b0958',
          'text-1': '#0a0968',
          'text-2': '#061ab2',
        },
        custom_cards: [
          'https://www.lockheedmartin.com/content/dam/lockheed-martin/au/photo/2023/news/F35-LMA-800.jpg',
          'https://images05.military.com/sites/default/files/media/equipment/military-aircraft/a-10-thunderbolt-ii/2014/02/a-10-thunderbolt-ii_010.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTwtQlr1M_oHMTwml1CZjeTH1dhSF5sPZFTA&s',
          'https://upload.wikimedia.org/wikipedia/commons/a/ab/P38_Lightning.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRvLuHm8_KGuzqdc6Jrb_xoCUtpyjFHuioFoA&s',
          'https://upload.wikimedia.org/wikipedia/commons/1/16/B-52_Stratofortress_assigned_to_the_307th_Bomb_Wing_%28cropped%29.jpg',
        ],
        card_colors: ['#051c8f'],
        custom_font: { family: "'Tektur'", link: 'Tektur:wght@400;700' },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTwtQlr1M_oHMTwml1CZjeTH1dhSF5sPZFTA&s',
    },
    {
      color: 'green',
      score: 4440,
      title: 'FloralSkeletons by Artemiez',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#a9b1ab',
          'background-1': '#6e8168',
          'background-2': '#6e8168',
          borders: '#0b2603',
          links: '#96727e',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://i.pinimg.com/originals/2c/88/01/2c88018fe9f7e1d1ee864393963a9932.jpg")',
          'sidebar-text': '#c5c5c5',
          'text-0': '#0b2603',
          'text-1': '#0b2603',
          'text-2': '#0b2603',
        },
        custom_cards: [
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQiUykbIBt0aWdphJiiVvg7sAqAI9RKwlDNssYz9RTWTv1pUSPQ6U2Jw2yFI_J446IvN3c&usqp=CAU',
          'https://64.media.tumblr.com/fe4dfae0c78feae38eb944ef34cb6782/tumblr_pv9t25nytm1rxnv9wo2_r1_400.jpg',
          'https://64.media.tumblr.com/a9d92611331b3b697ed5a487990bafe0/tumblr_pmdi7xZqte1rxnv9wo1_500.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSw4TzvtFRw4zJAAz8CL-ZjLDQQVqBHeNUfTEu79jCldfiqgI9W9GpM8ny8RwZIlME-GjA&usqp=CAU',
        ],
        card_colors: ['#96727e'],
        custom_font: { family: "'Comfortaa'", link: 'Comfortaa:wght@400;700' },
      },
      preview:
        'https://64.media.tumblr.com/a9d92611331b3b697ed5a487990bafe0/tumblr_pmdi7xZqte1rxnv9wo1_500.jpg',
    },
    {
      color: 'pink',
      score: 4440,
      title: 'Cybercore by weou',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f7e4ec',
          'background-1': '#f7e4ec',
          'background-2': '#a388c3',
          borders: '#f7e4ec',
          links: '#4f3659',
          sidebar:
            'linear-gradient(#b597a3c7, #b597a3c7), center url("https://i.pinimg.com/originals/e8/0d/db/e80ddb54d47213c49ab43d79299ffb42.jpg")',
          'sidebar-text': '#4a2f6a',
          'text-0': '#6f446a',
          'text-1': '#7b5487',
          'text-2': '#815f8c',
        },
        custom_cards: [
          'https://i.pinimg.com/originals/9a/af/17/9aaf1777e5929add3eac017f19d2ac50.jpg',
          'https://i.pinimg.com/originals/d5/10/94/d51094c5b98a38c8685aef5022a27ee9.jpg',
          'https://i.pinimg.com/originals/8f/f9/05/8ff905ab3ba169d8891545c1158d916c.webp',
          'https://i.pinimg.com/originals/5a/f3/3f/5af33feced73872150267498b6cc0b35.jpg',
        ],
        card_colors: ['#4f3659'],
        custom_font: { family: "'Lora'", link: 'Lora:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/originals/d5/10/94/d51094c5b98a38c8685aef5022a27ee9.jpg',
    },
    {
      color: 'beige',
      score: 4430,
      title: 'Dodgers by eemerson',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f9f6ee',
          'background-1': '',
          'background-2': '#005a9c',
          borders: '#005a9c',
          links: '#005a9c',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcQeRWMe9_5zvpf0aWAruasrbBXWYmDL76gw63prQKS1lMaTzoT1")',
          'sidebar-text': '#f9f6ee',
          'text-0': '#005a9c',
          'text-1': '#005a9c',
          'text-2': '#005a9c',
        },
        custom_cards: [
          'https://cdn.britannica.com/94/256194-050-DD861124/Shohei-Ohtani-Los-Angeles-Dodgers.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg7pOow06YXOpWFb18_kjZhNEasTwsY8OrPA&s',
          'https://www.ocregister.com/wp-content/uploads/2024/06/Dodgers-Yankees-Baseball.jpg?w=1569',
          'https://ca-times.brightspotcdn.com/dims4/default/15d6532/2147483647/strip/true/crop/1419x988+0+0/resize/1200x836!/format/webp/quality/75/?url=https%3A%2F%2Fcalifornia-times-brightspot.s3.amazonaws.com%2F14%2F98%2F77e8a8d6433a967765f5c2957945%2Fla-photos-1staff-638086-sp-1024-doders-rays-series36-wjs.jpg',
          'https://cdn.britannica.com/41/254841-050-7FC120C4/mlb-major-league-baseball-first-basemen-freddie-freeman-of-the-los-angeles-dodgers-at-mlb-photo-day-glendale-arizona.jpg?w=300',
        ],
        card_colors: ['#005a9c'],
        custom_font: { family: "'Arimo'", link: 'Arimo:wght@400;700' },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRg7pOow06YXOpWFb18_kjZhNEasTwsY8OrPA&s',
    },
    {
      color: 'purple',
      score: 4430,
      title: 'Coraline by Lemonspice',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#1d065b',
          'background-1': '#1d0061',
          'background-2': '#541985',
          borders: '#b868ee',
          links: '#ab56f0',
          sidebar: 'linear-gradient(#270094, #590094)',
          'sidebar-text': '#f5f5f5',
          'text-0': '#0179ad',
          'text-1': '#0179ad',
          'text-2': '#0179ad',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/ae/5e/f0/ae5ef0dd72b87967f0c556212d5b66e7.jpg',
          'https://www.intofilm.org/intofilm-production/6811/scaledcropped/3000x1688/resources/6811/coraline-ep2-focus-features.jpg',
          'https://w0.peakpx.com/wallpaper/245/675/HD-wallpaper-movie-coraline-coraline-movie.jpg',
          'https://uploads-ssl.webflow.com/63dc508f107c57e8cc0c5921/63ddef9f3700f08374ad190c_coraline_hidden_worlds_0.webp',
        ],
        card_colors: ['#ab56f0'],
        custom_font: {
          family: "'Barriecito'",
          link: 'Barriecito:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/ae/5e/f0/ae5ef0dd72b87967f0c556212d5b66e7.jpg',
    },
    {
      color: 'gray',
      score: 2130,
      title: 'MadokaMagica by wigglywiggly',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#4a606d',
          'background-1': '#5d7689',
          'background-2': '#4b5977',
          borders: '#363636',
          links: '#363636',
          sidebar: 'linear-gradient(#c9a6a6, #985252)',
          'sidebar-text': '#363636',
          'text-0': '#974e4e',
          'text-1': '#c3a304',
          'text-2': '#974e4e',
        },
        custom_cards: [
          'https://wallpapers.com/images/high/soft-aesthetic-1920-x-1080-background-k4lr2rwt6syhm2qp.webp',
          'https://preview.redd.it/00zi32egt5781.jpg?width=1080&crop=smart&auto=webp&s=ea1f33d11906c073d17d70ae7f374da67045b95f',
          'https://wallpapers.com/images/high/soft-aesthetic-2432-x-1621-background-c3dog6lvz2p6o4i7.webp',
          'https://preview.redd.it/o7992cigwtc71.jpg?width=640&crop=smart&auto=webp&s=ea9be6cb8f48c009657fb6ca47be7f7c053bfb67',
          'https://static1.cbrimages.com/wordpress/wp-content/uploads/2021/10/Madoka-Magica-Charlottes-Labyrinth.jpg',
          'https://s1.aminoapps.com/image/w3i5dpz3brmgbxvpk6pdaugukwqqijdl_00.jpg',
          'https://miro.medium.com/v2/resize:fit:1400/1*RTal0FkqDo3DThsqC7V-Hg.jpeg',
          'https://preview.redd.it/r273xrslmwv71.jpg?width=472&format=pjpg&auto=webp&s=0360ed3c89b235730b2d59d2025635b14325ad06',
          'https://i.pinimg.com/550x/12/0e/f6/120ef641cbfac8c4a303f3b360fab4d3.jpg',
          'https://frederation.wordpress.com/wp-content/uploads/2015/04/1294464844342.jpg',
          'https://www.bogleech.com/anime/magica-anthonies.jpg',
        ],
        card_colors: ['#c3a304'],
        custom_font: {
          family: "'Barriecito'",
          link: 'Barriecito:wght@400;700',
        },
      },
      preview:
        'https://preview.redd.it/o7992cigwtc71.jpg?width=640&crop=smart&auto=webp&s=ea9be6cb8f48c009657fb6ca47be7f7c053bfb67',
    },
    {
      color: 'yellow',
      score: 4340,
      title: 'Sunset by abi',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ffe5ad',
          'background-1': '#f9cc6c',
          'background-2': '#f00ab3',
          borders: '#f00ab3',
          links: '#61d9db',
          sidebar: 'linear-gradient(#fa3200, #61d9db)',
          'sidebar-text': '#f5f5f5',
          'text-0': '#fc6703',
          'text-1': '#823c03',
          'text-2': '#180101',
        },
        custom_cards: [
          'https://media.istockphoto.com/id/1494319207/photo/clouds-on-the-sky-sunset-weather.jpg?b=1&s=612x612&w=0&k=20&c=kUE3hRuIc_de1pHoi0NQ7kWSlayVdyq1F8EGSwfMZLc=',
          'https://images.alphacoders.com/750/thumb-1920-750975.jpg',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSM7zhgUr7OQI0qc0Ht-zsuubgGWoeDshFi6g&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCIUZmGVgcYURQbbUjM5oaHc-KoeDl3RTGtg&s',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzJ5OWfIe0t4_3aEqg-Y487f94sUdqrKEanQ&s',
          'https://static.vecteezy.com/system/resources/previews/001/226/748/non_2x/colorful-sunset-sky-free-photo.jpg',
        ],
        card_colors: ['#b599d6'],
        custom_font: { family: "'Quicksand'", link: 'Quicksand:wght@400;700' },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCIUZmGVgcYURQbbUjM5oaHc-KoeDl3RTGtg&s',
    },
    {
      color: 'black',
      score: 3320,
      title: 'Coraline by Katherine',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#3f2f79',
          'background-2': '#3f2f79',
          borders: '#171075',
          links: '#5449e9',
          sidebar:
            'linear-gradient(#1e1f39c7, #1e1f39c7), center url("https://i.pinimg.com/474x/30/16/62/3016623c7969e8d304bac889ccaad2a4.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#ffffff',
          'text-1': '#ffffff',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/30/16/62/3016623c7969e8d304bac889ccaad2a4.jpg',
          'https://i.pinimg.com/564x/4e/e5/c8/4ee5c8b2de115a4929b94398a18cedd6.jpg',
          'https://pbs.twimg.com/media/F_FwzOGWQAA0sAa?format=jpg&name=large',
          'https://i.pinimg.com/564x/1b/05/b6/1b05b6b8641452a39d702644c0a890d8.jpg',
          'https://i.pinimg.com/564x/53/59/28/535928a27bb1d0906c4518ba6f01edc4.jpg',
        ],
        card_colors: ['#2016b1'],
        custom_font: { family: "'Comfortaa'", link: 'Comfortaa:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/30/16/62/3016623c7969e8d304bac889ccaad2a4.jpg',
    },
    {
      color: 'lightblue',
      score: 4440,
      title: 'BlueGhibil by Yakilyn',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#e7ecef',
          'background-1': '#e7ecef',
          'background-2': '#ffffff',
          borders: '#6096ba',
          links: '#6096ba',
          sidebar: '#003459',
          'sidebar-text': '#ffffff',
          'text-0': '#274c77',
          'text-1': '#003d5b',
          'text-2': '#003d5b',
        },
        custom_cards: [
          'https://i.pinimg.com/474x/82/c4/a5/82c4a56976342a37fc0fe4ce0f17d64e.jpg',
          'https://i.pinimg.com/474x/2a/61/60/2a616055aacfa85244516b3d69a1e60b.jpg',
          'https://i.pinimg.com/474x/66/f4/bc/66f4bccca9ff8d12ed3e5d2b51192654.jpg',
          'https://i.pinimg.com/474x/c3/b9/77/c3b9777f3c5cdcff1ec60ad34249cc35.jpg',
          'https://i.pinimg.com/474x/dd/d8/af/ddd8af4c08b9ddb937cf23229a1dbe16.jpg',
        ],
        card_colors: ['#556c7e'],
        custom_font: { family: "'Jost'", link: 'Jost:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/474x/82/c4/a5/82c4a56976342a37fc0fe4ce0f17d64e.jpg',
    },
    {
      color: 'blue',
      score: 3440,
      title: 'StellarScholar by Nova',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#929ec9',
          'background-1': '#697abf',
          'background-2': '#a0a9ca',
          borders: '#3f2a79',
          links: '#121131',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://img.freepik.com/premium-photo/there-is-picture-night-sky-with-clouds-stars-generative-ai_958124-15844.jpg")',
          'sidebar-text': '#ca9b49',
          'text-0': '#080821',
          'text-1': '#080821',
          'text-2': '#242461',
        },
        custom_cards: [
          'https://wallpapers.com/images/featured/night-sky-u1qhinntfbrnwtnq.jpg',
          'https://i.pinimg.com/originals/98/1a/39/981a39126710478d76869f47ea286f0a.jpg',
          'https://t4.ftcdn.net/jpg/01/65/24/53/360_F_165245377_ZEjgXljOBKVjjHtdc3ZwMTkKquSt6H1W.jpg',
          'https://m.media-amazon.com/images/I/71OIx8STMCL._AC_UF1000,1000_QL80_.jpg',
          'https://i.pinimg.com/564x/17/1c/3b/171c3b05928fe398debf93aac10da909.jpg',
          'https://i.pinimg.com/736x/22/ea/5f/22ea5f11dabdee0be49a61eb6c2ab8e5.jpg',
          'https://media.istockphoto.com/id/157380227/photo/full-moon-behind-trees-in-a-blue-sky.webp?b=1&s=612x612&w=0&k=20&c=jYUMplV5Zfd4V9ypREyofSITzm-LMM6f_C1NARjosZI=',
          'https://img.cdn-pictorem.com/uploads/collection/J/JP7MIH6IKN/900_J-R-Picard_Moon_Dancer_in_Art_Nouveau.jpg',
        ],
        card_colors: [
          '#5f0d57',
          '#5d0d58',
          '#5b0d58',
          '#590d59',
          '#570d59',
          '#540c5a',
          '#520c5a',
          '#500c5b',
        ],
        custom_font: {
          family: "'Montserrat'",
          link: 'Montserrat:wght@400;700',
        },
      },
      preview:
        'https://wallpapers.com/images/featured/night-sky-u1qhinntfbrnwtnq.jpg',
    },
    {
      color: 'beige',
      score: 4340,
      title: 'FallVibes by Erika',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#ebd7bd',
          'background-1': '#f5f5f5',
          'background-2': '#d4d4d4',
          borders: '#8b9fac',
          links: '#594312',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://i.pinimg.com/236x/94/a2/36/94a2364d61791099d44b60d1d8ab8057.jpg")',
          'sidebar-text': '#ffffff',
          'text-0': '#477494',
          'text-1': '#3c3939',
          'text-2': '#908989',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/96/d9/b0/96d9b0249cec48abeccdcb8a7372c9ff.jpg',
          'https://i.pinimg.com/236x/76/4b/3f/764b3fc4f908b76a0bb17388c44625fc.jpg',
          'https://i.pinimg.com/236x/db/78/11/db7811b273cb9109c6e4af5a017ec86f.jpg',
          'https://i.pinimg.com/236x/b9/ee/5e/b9ee5e873fa4342fdf5b850653f607b2.jpg',
          'https://i.pinimg.com/236x/c0/70/b8/c070b8c906b7eb45451b73dfb755e79a.jpg',
          'https://i.pinimg.com/236x/71/65/f8/7165f8a410677ee8f0b45d16a6c93be9.jpg',
          'https://i.pinimg.com/236x/01/75/0a/01750afb06f25558275815841548f930.jpg',
          'https://i.pinimg.com/236x/6a/5d/43/6a5d4335434ce5da180416b38608c596.jpg',
          'https://i.pinimg.com/474x/63/63/1c/63631c05ec0efdc0c2ea03eacd07e0be.jpg',
          'https://i.pinimg.com/236x/1c/6e/2c/1c6e2c2edcfd88857909566ab5fbe926.jpg',
        ],
        card_colors: [
          '#eaac8b',
          '#e56b6f',
          '#b56576',
          '#6d597a',
          '#355070',
          '#eaac8b',
          '#e56b6f',
          '#b56576',
          '#6d597a',
          '#355070',
          '#eaac8b',
          '#e56b6f',
          '#b56576',
        ],
        custom_font: { family: "'Poppins'", link: 'Poppins:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/236x/01/75/0a/01750afb06f25558275815841548f930.jpg',
    },
    {
      color: 'beige',
      score: 3330,
      title: 'Hogwarts by Skyler',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#d1c9ad',
          'background-1': '#842e2e',
          'background-2': '#832a2a',
          borders: '#8b2323',
          links: '#902323',
          sidebar: 'linear-gradient(#973b3b, #ffffff)',
          'sidebar-text': '#ffffff',
          'text-0': '#f5f5f5',
          'text-1': '#ffffff',
          'text-2': '#a45151',
        },
        custom_cards: [
          'https://as1.ftcdn.net/v2/jpg/03/26/22/48/1000_F_326224870_vB8XRJbWr0qDG5bhAomLjVlKzcUXPdKA.jpg',
          'https://wallpapers.com/images/high/marauders-map-front-page-ktm5p8uzrze9jf82.webp',
          'https://t3.ftcdn.net/jpg/03/98/15/24/240_F_398152421_haFvEn6IXoOm3JpTV3qXFn6ae1O01YwZ.jpg',
          'https://www.connormollison.co.uk/wp-content/uploads/2018/11/Loch-Shiel.jpg',
        ],
        card_colors: ['#882525'],
        custom_font: { family: "'Cinzel'", link: 'Cinzel:wght@400;700' },
      },
      preview:
        'https://wallpapers.com/images/high/marauders-map-front-page-ktm5p8uzrze9jf82.webp',
    },
    {
      color: 'black',
      score: 3420,
      title: 'RepEra by Brooke',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#000000',
          'background-1': '#000000',
          'background-2': '#000000',
          borders: '#660000',
          links: '#660000',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://i.pinimg.com/736x/19/cb/41/19cb416efe3460163bd75b9966628a88.jpg")',
          'sidebar-text': '#fefefe',
          'text-0': '#fefefe',
          'text-1': '#fefefe',
          'text-2': '#fefefe',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/84/84/e9/8484e992558502b9bcec0c305cea4ae5.jpg',
          'https://i.pinimg.com/originals/94/17/49/941749d4b2ef0dc1205c50325be2592a.gif',
          'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da8442f8d0b0a8d7b419a3ad3eb6',
          'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Taylor_Swift_The_Eras_Tour_Reputation_Era_Set_%2853109451846%29.jpg/411px-Taylor_Swift_The_Eras_Tour_Reputation_Era_Set_%2853109451846%29.jpg',
          'https://64.media.tumblr.com/64dffc01e1e46bfc4a0ea43ca94717c5/tumblr_pqjwteoj1n1ufsbe8o3_400.gif',
        ],
        card_colors: ['#660000'],
        custom_font: { family: "'Caveat'", link: 'Caveat:wght@400;700' },
      },
      preview:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Taylor_Swift_The_Eras_Tour_Reputation_Era_Set_%2853109451846%29.jpg/411px-Taylor_Swift_The_Eras_Tour_Reputation_Era_Set_%2853109451846%29.jpg',
    },

    {
      color: 'beige',
      score: 0,
      title: 'Forest Fairy by Kylie',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#d2c6b2',
          'background-1': '#d2c6b2',
          'background-2': '#b09e8d',
          borders: '#775a6b',
          links: '#ae8f91',
          sidebar: '#d2c6b2',
          'sidebar-text': '#211c17',
          'text-0': '#211c17',
          'text-1': '#61694f',
          'text-2': '#211c17',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/ee/73/cf/ee73cff65df33b5dacfb922f669ab00a.jpg',
          'https://i.pinimg.com/564x/3d/45/e3/3d45e3042e0e8f273cf65b2fd07f36ac.jpg',
          'https://i.pinimg.com/564x/af/f2/0a/aff20a803d61658be15274688c96e1e2.jpg',
          'https://i.pinimg.com/564x/6f/04/b4/6f04b4b11f12581f37f1253209ed7a9f.jpg',
          'https://i.pinimg.com/564x/8e/41/4c/8e414c7db87e13c356d2a409c36db0ca.jpg',
          'https://i.pinimg.com/564x/2d/82/a8/2d82a8995def9311cbeb0300379db5fb.jpg',
          'https://i.pinimg.com/564x/2e/09/de/2e09de339b4287bab1a0a9b2c825b90e.jpg',
          'https://i.pinimg.com/564x/43/57/44/43574408e884ea7719642e799d1d7549.jpg',
        ],
        card_colors: [
          '#c6adc2',
          '#a65963',
          '#849e61',
          '#8f707d',
          '#666d57',
          '#b28d4d',
          '#708f7c',
          '#009688',
        ],
        custom_font: { family: "'Texturina'", link: 'Texturina:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/2e/09/de/2e09de339b4287bab1a0a9b2c825b90e.jpg',
    },
    {
      color: 'gray',
      score: 0,
      title: 'Bucky Barnes by Desiree',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#303030',
          'background-1': '#303030',
          'background-2': '#141414',
          borders: '#1e1e1e',
          links: '#ae8c84',
          sidebar:
            'linear-gradient(#303030c7, #303030c7), center url("https://e0.pxfuel.com/wallpapers/567/145/desktop-wallpaper-the-art-of-phillip-anthony-dark-grey-black-aesthetic-grey-iphone-black-gray-aesthetic.jpg")',
          'sidebar-text': '#7e615b',
          'text-0': '#7e615b',
          'text-1': '#7e615b',
          'text-2': '#614b48',
        },
        custom_cards: [
          'https://64.media.tumblr.com/d4b8ded40caf6dd56d93e1c164bb3887/00fe568e9d0796b0-28/s1280x1920/2b5ffb4a11b70f814c1ec081ad6782f437506042.jpg',
          'https://pbs.twimg.com/media/EwONWyuWYAgxe6g.jpg',
          'https://i.pinimg.com/474x/b1/21/c2/b121c2752f9899cd0abc4355d50b47af.jpg',
          'https://i.pinimg.com/originals/e3/80/04/e3800498d1dbf8338d4ed9eaff948ac3.jpg',
          'https://i.pinimg.com/750x/b4/9b/ff/b49bff69c567dd3e9a39d7db8b662f5d.jpg',
          'https://64.media.tumblr.com/785799419418a335a8e6d97b1e141bc8/00fe568e9d0796b0-41/s1280x1920/0d66d39d23d83054cafb9ef36f0c18b0d1a83fc3.jpg',
        ],
        card_colors: [
          '#986c16',
          '#a5a58d',
          '#b7b7a4',
          '#ffe8d6',
          '#ddbea9',
          '#cb997e',
          '#6b705c',
        ],
        custom_font: {
          family: "'Special Elite'",
          link: 'Special+Elite:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/750x/b4/9b/ff/b49bff69c567dd3e9a39d7db8b662f5d.jpg',
    },
    {
      color: 'orange',
      score: 5555,
      title: 'Fall by Static',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f0cfb7',
          'background-1': '#e5833e',
          'background-2': '#d76b1d',
          borders: '#B2560D',
          links: '#893101',
          sidebar: 'linear-gradient(#80400B, #BE5504)',
          'sidebar-text': '#281201',
          'text-0': '#532a09',
          'text-1': '#642c02',
          'text-2': '#893101',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/cd/1f/5d/cd1f5df992245362003001fb6f4b8168.jpg',
          'https://i.pinimg.com/564x/bf/64/0f/bf640fdb0ee5d669e3487de514469e89.jpg',
          'https://i.pinimg.com/originals/1d/6e/d9/1d6ed9c772cb46bfffa5f5055475e827.gif',
          'https://i.pinimg.com/originals/3a/eb/49/3aeb495a4fdda62e53a366ec68540488.gif',
          'https://i.pinimg.com/564x/ca/1e/0b/ca1e0b3c7e066fc3a9d3ee0c57225bde.jpg',
          'https://i.pinimg.com/564x/5a/9e/b1/5a9eb1b7af5a7b0351b272f9c63eca66.jpg',
          'https://i.pinimg.com/564x/53/f2/76/53f276d10d50a40246f5e877ffde6cdd.jpg',
        ],
        card_colors: ['#893101'],
        custom_font: {
          family: "'Inria Sans'",
          link: 'Inria+Sans:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/ca/1e/0b/ca1e0b3c7e066fc3a9d3ee0c57225bde.jpg',
    },
    {
      color: 'brown',
      score: 0,
      title: 'Garden wall by ghost girl',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#201109',
          'background-1': '#8f6542',
          'background-2': '#8d5835',
          borders: '#000000',
          links: '#bc8552',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://media1.tenor.com/m/lZa7QzVtaWwAAAAC/over-the-garden-wall.gif")',
          'sidebar-text': '#7f849c',
          'text-0': '#beb6b6',
          'text-1': '#bbbbbf',
          'text-2': '#b9c1b9',
        },
        custom_cards: [
          'https://media1.tenor.com/m/E9NtNsnEppcAAAAC/over-the-garden-wall-garden-wall.gif',
          'https://media1.tenor.com/m/mVoRJhr2a9kAAAAC/anime-over-the-garden-wall.gif',
          'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExbm5qNmtweWtjZnhtN25yOHczc3QzdjI2ZXR6b3YxZ3p1cHMzejZlOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/lKD3pLFTjVCxy/giphy.webp',
          'https://media1.tenor.com/m/BNlqs1Tt6gYAAAAC/pumpkin-fall.gif',
          'https://media1.tenor.com/m/dzIZVdIplEwAAAAC/over-the-garden-wall-otgw.gif',
          'https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExa2Z3dG0xa3htYW4weDl2NzVwdXJ2amY1cjlkY2Ewa3JqNmlxaHkxbiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/3o7ZenN6gENEUX317O/giphy.webp',
          'https://media1.tenor.com/m/GOMfjC9vOxEAAAAd/wirt-over-the-garden-wall.gif',
        ],
        card_colors: [
          '#ffc971',
          '#ffb627',
          '#ff9505',
          '#e2711d',
          '#cc5803',
          '#ffc971',
          '#ffb627',
        ],
        custom_font: {
          family: "'Permanent Marker'",
          link: 'Permanent+Marker:wght@400;700',
        },
      },
      preview: 'https://media1.tenor.com/m/BNlqs1Tt6gYAAAAC/pumpkin-fall.gif',
    },
    {
      color: 'green',
      score: 0,
      title: 'Garden Green by Hayden Lee',
      exports: {
        disable_color_overlay: true,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#1c3520',
          'background-1': '#141f17',
          'background-2': '#7b9679',
          borders: '#84a98c',
          links: '#5f973f',
          sidebar: 'linear-gradient(#094e23, #102316)',
          'sidebar-text': '#e2e8de',
          'text-0': '#b1e98b',
          'text-1': '#dcf5cc',
          'text-2': '#cfe4be',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/75/96/30/7596305ee643c5040b69f0d99a65e0c4.jpg',
          'https://i.pinimg.com/474x/e4/c7/db/e4c7db80b8cc0d8153da5a634e58f754.jpg',
          'https://i.pinimg.com/474x/17/34/db/1734db37f8e995b952fbb9ebb1d817d1.jpg',
          'https://i.pinimg.com/474x/16/5a/6c/165a6cbff2a2f015ba73333230174e28.jpg',
          'https://i.pinimg.com/564x/a1/50/b5/a150b562e5f0b27d8c456efc33cc229b.jpg',
        ],
        card_colors: ['#5f973f'],
        custom_font: {
          family: "'Dancing Script'",
          link: 'Dancing+Script:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/474x/17/34/db/1734db37f8e995b952fbb9ebb1d817d1.jpg',
    },
    {
      color: 'orange',
      score: 5555,
      title: 'VanGogh by Cam',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#c5733D',
          'background-1': '#d2946b',
          'background-2': '#774423',
          borders: '#774423',
          links: '#774423',
          sidebar: '#774423',
          'sidebar-text': '#c5733D',
          'text-0': '#774423',
          'text-1': '#774423',
          'text-2': '#774423',
        },
        custom_cards: [
          'https://www.1st-art-gallery.com/media/catalog/product/cache/3375d1f37505735cd1cd3d14291df1c6/paintingsL/414336/spectators-in-the-arena-at-arl_thumb.webp',
          'https://collectionapi.metmuseum.org/api/collection/v1/iiif/436524/800285/main-image',
          'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuW_bog_orRxMf1CVnLmTEjifPBJFCT_hzLg&s',
          'https://cdn2.picryl.com/photo/1900/12/31/vincent-van-gogh-wheat-field-behind-saint-paul-hospital-with-a-reaper-google-881c86-1024.jpg',
          'https://upload.wikimedia.org/wikipedia/commons/9/9e/WLA_metmuseum_Irises_by_Vincent_van_Gogh.jpg',
          'https://media.tate.org.uk/art/images/work/N/N04/N04713_10.jpg',
          'https://m.media-amazon.com/images/I/51bHeJd4-CL.jpg',
          'https://lh3.googleusercontent.com/proxy/f-AGYas1E5VavPdH1GCh_sCCG8vlQwE3RzbmbnDcHuAvzui5m0Nf3pL19c8EAtcDGps5S97N6B6fmqCFSef2',
          'https://www.travelfranceonline.com/wp-content/plugins/phastpress/phast.php/c2Vydm/ljZT1pbWFnZXMmc3JjPWh0dHBzJTNBJTJGJTJGd3d3LnRyYXZlbGZyYW5jZW9ubGluZS5jb20lMkZ3cC1jb250ZW50JTJGdXBsb2FkcyUyRjIwMjQlMkYwNyUyRkdvZ2hfVmluY2VudF9BdXZlcnMtc3VyLU9pc2VfQ290dGFnZXMxLmpwZyZjYWNoZU1hcmtlcj0xNzIwODc1NzAxLTQ3OTU1JnRva2VuPTM5MWYwNWVlN2I5OTUzZDA.q.jpg',
          'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/The_Plain_of_Auvers_-_Vincent_van_Gogh_-_Google_Cultural_Institute.jpg/1024px-The_Plain_of_Auvers_-_Vincent_van_Gogh_-_Google_Cultural_Institute.jpg',
          'https://upload.wikimedia.org/wikipedia/commons/a/ab/Vincent_van_Gogh_-_Tree_Roots_and_Trunks_%28F816%29.jpg',
          'https://news.bbcimg.co.uk/media/images/82797000/jpg/_82797607_9340lot18vangogh.jpg',
          'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Irises-Vincent_van_Gogh.jpg/1200px-Irises-Vincent_van_Gogh.jpg',
        ],
        card_colors: [
          '#605b56',
          '#605b32',
          '#ff9999',
          '#90a9b7',
          '#829a99',
          '#e3cab6',
          '#d4aa7d',
          '#d5c9df',
          '#ccd7e4',
          '#9bb0ba',
          '#d2d8b3',
          '#acc18a',
          '#aea3b0',
          '#ffa85c',
          '#e48541',
          '#d89d77',
          '#626e7b',
          '#efd09e',
          '#837a75',
        ],
        custom_font: { family: "'Mali'", link: 'Mali:wght@400;700' },
      },
      preview:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTuW_bog_orRxMf1CVnLmTEjifPBJFCT_hzLg&s',
    },
    {
      color: 'beige',
      score: 5555,
      title: 'Beachy by Crystal',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f2f0e4',
          'background-1': '#f5f5f5',
          'background-2': '#f5f5f5',
          borders: '#f5f5f5',
          links: '#a0',
          sidebar:
            'linear-gradient(#ef946cc7, #e9ba6bc7), center url("https://i.pinimg.com/736x/73/db/35/73db3519f3f5887e269eaa5850467a33.jpg")',
          'sidebar-text': '#153952',
          'text-0': '#27282b',
          'text-1': '#27282b',
          'text-2': '#27282b',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/d5/94/65/d59465ba69c89d0d2a3250f980c61b1d.jpg',
          'https://i.pinimg.com/736x/1c/8e/d9/1c8ed985e23e5db782b888d6e38f6b02.jpg',
          'https://i.pinimg.com/474x/35/1e/56/351e56fa3972d928f29e00e06024eb60.jpg',
          'https://i.pinimg.com/564x/9a/93/42/9a9342d2584240498aa6b08352f6e7e6.jpg',
          'https://i.pinimg.com/736x/6b/e7/ba/6be7ba698c41b0c8fee393e5ff37f22c.jpg',
        ],
        card_colors: ['#ef946c', '#1e7a8c', '#b6e2de', '#153952', '#e9ba6b'],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://i.pinimg.com/736x/d5/94/65/d59465ba69c89d0d2a3250f980c61b1d.jpg',
    },
    {
      color: 'red',
      score: 5555,
      title: 'GothicGraveyard by lyramagna',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#2b0d0d',
          'background-1': '#592727',
          'background-2': '#592727',
          borders: '#592727',
          links: '#804747',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://i.pinimg.com/236x/47/b0/08/47b008d745100938d4dea59e17f70bcc.jpg")',
          'sidebar-text': '#a3a3a3',
          'text-0': '#803c3c',
          'text-1': '#6c5a5a',
          'text-2': '#6c5a5a',
        },
        custom_cards: [
          'https://i.pinimg.com/236x/5e/5b/4b/5e5b4b418e56e6b4bff3f1c5413d0cae.jpg',
          'https://i.pinimg.com/236x/6a/81/6c/6a816c04e68f55da7f6396faac980e92.jpg',
          'https://i.pinimg.com/564x/ee/ce/39/eece39a86f39fd608c61c353580cf462.jpg',
          'https://i.pinimg.com/236x/ac/92/60/ac926035cfbd7576a33e9304ee922529.jpg',
          'https://i.pinimg.com/236x/a9/26/3e/a9263ec6d484b1b12139bca1aeeff410.jpg',
          'https://i.pinimg.com/236x/22/30/17/223017f48b432887b2c63453c5ea00ee.jpg',
          'https://i.pinimg.com/236x/70/ef/18/70ef181592956742fb693a9725db31e7.jpg',
          'https://i.pinimg.com/236x/90/55/4e/90554ef4a466e77dee521986f26a1858.jpg',
        ],
        card_colors: ['#1f1f1f'],
        custom_font: { family: "'Texturina'", link: 'Texturina:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/236x/90/55/4e/90554ef4a466e77dee521986f26a1858.jpg',
    },
    {
      color: 'beige',
      score: 5555,
      title: 'Pusheen by elsie',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fffdee',
          'background-1': '#6b4c4c',
          'background-2': '#594646',
          borders: '#9a8484',
          links: '#7c7a7f',
          sidebar: '#fffdee',
          'sidebar-text': '#31261c',
          'text-0': '#31261c',
          'text-1': '#31261c',
          'text-2': '#31261c',
        },
        custom_cards: [
          'https://pusheen.com/wp-content/uploads/2014/07/tumblr_n8789zUHLD1qhy6c9o1_500.gif',
          'https://pusheen.com/wp-content/uploads/2023/11/Capybar_Hot_Springs_GIF.gif',
          'https://pusheen.com/wp-content/uploads/2023/03/Pusheen_Plop.gif',
          'https://pusheen.com/wp-content/uploads/2018/07/tumblr_p7tdo3tjSM1qhy6c9o1_1280.gif',
        ],
        card_colors: ['#fff1e6', '#fde2e4', '#fad2e1', '#bee1e6'],
        custom_font: {
          family: "'Inconsolata'",
          link: 'Inconsolata:wght@400;700',
        },
      },
      preview:
        'https://pusheen.com/wp-content/uploads/2023/11/Capybar_Hot_Springs_GIF.gif',
    },
    {
      color: 'white',
      score: 5555,
      title: 'NationalParks by Ashlyn',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#f5f5f5',
          'background-1': '#f6bd60',
          'background-2': '#262626',
          borders: '#3c3c3c',
          links: '#833e16',
          sidebar: '#273a0d',
          'sidebar-text': '#f5f5f5',
          'text-0': '#2a63a1',
          'text-1': '#889849',
          'text-2': '#c95c16',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/17/26/a8/1726a8071771a9f1f85db1579cb3eb47.jpg',
          'https://i.pinimg.com/564x/41/01/7d/41017d2833ec89de2407a18411bb8343.jpg',
          'https://i.pinimg.com/736x/7f/67/a5/7f67a5499fd552070fd59bf9721fe02b.jpg',
          'https://i.pinimg.com/564x/72/59/76/725976bd0e48e9a9b83eb08c08ee7639.jpg',
          'https://i.pinimg.com/564x/9d/ce/11/9dce115cfc4e7ba876f9fb73ba878a1f.jpg',
          'https://i.pinimg.com/474x/05/63/c6/0563c6e73613ca60bffc1e63f7523d0c.jpg',
        ],
        card_colors: ['#833e16'],
        custom_font: {
          family: "'Expletus Sans'",
          link: 'Expletus+Sans:wght@400;700',
        },
      },
      preview:
        'https://i.pinimg.com/564x/41/01/7d/41017d2833ec89de2407a18411bb8343.jpg',
    },
    {
      color: 'lightgreen',
      score: 5555,
      title: 'Positions by LadyGrande',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#d0e1d0',
          'background-1': '#bdcfb5',
          'background-2': '#a2af9d',
          borders: '#b0cca3',
          links: '#d0e7c5',
          sidebar:
            'linear-gradient(#ccdfc3c7, #5a6a53c7), center url("https://i.pinimg.com/564x/c5/26/52/c526524d5d992dd5f32ce56c15115fe6.jpg")',
          'sidebar-text': '#fffcfa',
          'text-0': '#95a58d',
          'text-1': '#a3bf97',
          'text-2': '#c1eaae',
        },
        custom_cards: [
          'https://mir-s3-cdn-cf.behance.net/project_modules/max_1200/372f69106764533.5f979ca916959.jpg',
          'https://cdn.dribbble.com/users/5932911/screenshots/15115256/media/d678bfb66e5e994ccb6d63b1b979e72b.png?resize=1600x1200&vertical=center',
          'https://akns-images.eonline.com/eol_images/Entire_Site/2020922/rs_1200x1200-201022212210-1200-araian-grande-mv-102220.jpg?fit=around%7C1080:1080&output-quality=90&crop=1080:1080;center,top',
          'https://i.ytimg.com/vi/YOVLdU9uVvk/mqdefault.jpg',
          'https://lastfm.freetls.fastly.net/i/u/avatar170s/6b32b8cbee6e4d151e75507b25ffb964',
          'https://www.rollingstone.com/wp-content/uploads/2020/11/ariana-grande-AlbumPressPhoto.jpg?w=1581&h=1054&crop=1',
          'https://mir-s3-cdn-cf.behance.net/projects/404/0c8e41118112283.6082933b5929b.png',
          'https://cdn.dribbble.com/users/4818213/screenshots/14704759/media/4a692830e71b4c4cdfb0b007828736a1.png?resize=1600x1200&vertical=center',
        ],
        card_colors: [
          '#62725a',
          '#64755d',
          '#67785f',
          '#697b62',
          '#5c6a54',
          '#5e6d57',
          '#5f6f58',
          '#62715a',
        ],
        custom_font: { family: '', link: '' },
      },
      preview:
        'https://akns-images.eonline.com/eol_images/Entire_Site/2020922/rs_1200x1200-201022212210-1200-araian-grande-mv-102220.jpg?fit=around%7C1080:1080&output-quality=90&crop=1080:1080;center,top',
    },
    {
      color: 'gray',
      score: 5555,
      title: 'Frieren by Faeriefully',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#60657b',
          'background-1': '#353535',
          'background-2': '#b0d4cc',
          borders: '#d7d6d6',
          links: '#5bae83',
          sidebar: 'linear-gradient(#182152, #70be8c)',
          'sidebar-text': '#f5f5f5',
          'text-0': '#bec5c4',
          'text-1': '#acc9c2',
          'text-2': '#c2e5f5',
        },
        custom_cards: [
          'https://64.media.tumblr.com/3250a784972f89cdbfea253965c34cd0/f21b5a88cdd2d1f6-b0/s540x810/1ca346168391c0af6d6d036ad6ce46a1f0605511.gif',
          'https://meguminexplosionblog.wordpress.com/wp-content/uploads/2023/10/fern-frieren-anime-fern-frieren.gif?w=498',
          'https://64.media.tumblr.com/273e48159243483a123f127ed79656d1/88844ae8be4d1091-9c/s540x810/739d22f7e20649a0694419eaa39a0f9b4c5bac59.gifv',
          'https://64.media.tumblr.com/339ea6d7a3c1a4402675a45f8fcfcbb0/f839a0c00f66bcd6-ec/s540x810/46054489c7d3854487488568d1484d1a5d2fdb78.gif',
          'https://media1.tenor.com/m/h6XlgMwYBnkAAAAd/frieren-sousou-no-frieren.gif',
          'https://giffiles.alphacoders.com/221/221795.gif',
          'https://64.media.tumblr.com/df78e4235d1501620a45ffca3960e1f6/f839a0c00f66bcd6-b4/s540x810/a44e1892a4a4234241417e1a914ccac93d9324e4.gif',
          'https://i.pinimg.com/originals/71/90/6c/71906c5eff4079a648c57aed47cc46fc.gif',
          'https://64.media.tumblr.com/e6b2c483310a66447773ca70426752a8/309287d767a483c2-15/s540x810/6f1d2051b038ef3b5122b1eb03dbced434590a0a.gifv',
          'https://64.media.tumblr.com/339ea6d7a3c1a4402675a45f8fcfcbb0/f839a0c00f66bcd6-ec/s540x810/46054489c7d3854487488568d1484d1a5d2fdb78.gifv',
          'https://miro.medium.com/v2/resize:fit:996/0*Tcf1VOgXqrweEwzl.gif',
          'https://media.tenor.com/VF52YCUBibQAAAAM/anime-frieren-beyond-the-journeys-end.gif',
        ],
        card_colors: ['#a08a5a'],
        custom_font: {
          family: "'Yuji Syuku'",
          link: 'Yuji+Syuku:wght@400;700',
        },
      },
      preview:
        'https://media.tenor.com/VF52YCUBibQAAAAM/anime-frieren-beyond-the-journeys-end.gif',
    },
    {
      color: 'lightblue',
      score: 5555,
      title: 'Manatees by Jocie',
      exports: {
        disable_color_overlay: false,
        gradient_cards: true,
        dark_mode: true,
        dark_preset: {
          'background-0': '#6d92a2',
          'background-1': '#475d66',
          'background-2': '#638092',
          borders: '#082187',
          links: '#364453',
          sidebar:
            'linear-gradient(#1a4238c7, #3e4160c7), center url("https://i.pinimg.com/originals/da/eb/36/daeb3684ed1b4f653e7c6d99b7b1b160.jpg")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#f5f5f5',
          'text-1': '#ffffff',
          'text-2': '#ffffff',
        },
        custom_cards: [
          'https://www.fau.edu/newsdesk/images/news/manatee-romaine-newsdesk.jpg',
          'https://www.nwf.org/-/media/NEW-WEBSITE/Shared-Folder/Magazines/2022/Jun-Jul/manatees-mother-and-calf-JJ22-900x591.jpg',
          'https://i.pinimg.com/564x/3b/5f/bc/3b5fbcf6232a1af76c173f5efbfc4ae1.jpg',
        ],
        card_colors: ['#1a806a', '#1a7c6c', '#1a796d', '#19756d'],
        custom_font: { family: "'Lora'", link: 'Lora:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/3b/5f/bc/3b5fbcf6232a1af76c173f5efbfc4ae1.jpg',
    },
    {
      color: 'beige',
      score: 5555,
      title: 'Study Girl by Luna',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#cea183',
          'background-1': '#efcfaf',
          'background-2': '#ffffec',
          borders: '#533427',
          links: '#ff5286',
          sidebar:
            'linear-gradient(#4b2a16c7, #4b2a16c7), center url("https://p16-va.lemon8cdn.com/tos-maliva-v-ac5634-us/okIenbELlO7MOWflXeEM4gArSgC8HJdAoQASQz~tplv-tej9nj120t-origin.webp")',
          'sidebar-text': '#ca9572',
          'text-0': '#4b2a16',
          'text-1': '#533427',
          'text-2': '#4b2a16',
        },
        custom_cards: [
          null,
          'https://files.combyne.com/571bb277a4fb87839de2a597afdf2caf_image.jpg',
          'https://i.pinimg.com/736x/d0/75/fb/d075fb2ae9e5a18a72f10bf534127f1a.jpg',
          'https://i.pinimg.com/736x/88/22/44/8822448a1481a11f1a53936d4373d0ff.jpg',
          'https://i.pinimg.com/736x/d6/de/e4/d6dee4ba44b75a9bfdb5012469852fca.jpg',
        ],
        card_colors: ['#673723'],
        custom_font: { family: "'Nerko One'", link: 'Nerko One:wght@400;700' },
      },
      preview:
        'https://files.combyne.com/571bb277a4fb87839de2a597afdf2caf_image.jpg',
    },
    {
      color: 'beige',
      score: 5555,
      title: 'CafeTime by HMR_YRK',
      exports: {
        disable_color_overlay: false,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#fdfff5',
          'background-1': '#ffffff',
          'background-2': '#ffffff',
          borders: '#ddb57a',
          links: '#c09c7c',
          sidebar: 'linear-gradient(#7e5d44, #ffd685)',
          'sidebar-text': '#ffffff',
          'text-0': '#76583d',
          'text-1': '#58412c',
          'text-2': '#58412c',
        },
        custom_cards: [
          'https://i.pinimg.com/564x/92/c7/2c/92c72c90aae903abd45451ca73eabfc5.jpg',
          'https://i.pinimg.com/564x/b7/5c/ca/b75ccaf47db6238ddce7e2999ccabb26.jpg',
          'https://i.pinimg.com/564x/6f/1a/66/6f1a663cd14c7df6eeaa12e879dce2b3.jpg',
          'https://i.pinimg.com/564x/b0/85/3b/b0853b8afd95a536192886e3ac4137e3.jpg',
          'https://i.pinimg.com/564x/5b/62/1d/5b621d37eba0898e17d41540a9388387.jpg',
          'https://i.pinimg.com/564x/e0/9d/6a/e09d6a540b6f5f186b22dc9912a41ec6.jpg',
          'https://i.pinimg.com/564x/68/d9/17/68d917e592e6609ea2915882966a1e0a.jpg',
          'https://i.pinimg.com/564x/41/45/3e/41453eea3e262f07ecf0d9e3f9b110f4.jpg',
          'https://i.pinimg.com/564x/61/2a/68/612a681fb0c3672a8a81e19f368cc91f.jpg',
          'https://i.pinimg.com/564x/ef/3e/20/ef3e20016a96637003397018e7151826.jpg',
        ],
        card_colors: [
          '#c2a48d',
          '#bd9f88',
          '#b89a84',
          '#b3957f',
          '#ae917a',
          '#a98c76',
          '#a48771',
          '#9f826c',
          '#9a7d68',
          '#957963',
          '#90745e',
          '#8b6f5a',
          '#866a55',
          '#816550',
          '#7d614c',
          '#c2a48d',
        ],
        custom_font: { family: "'Quicksand'", link: 'Quicksand:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/564x/6f/1a/66/6f1a663cd14c7df6eeaa12e879dce2b3.jpg',
    },
    {
      color: 'black',
      score: 5555,
      title: 'JJK by crim',
      exports: {
        disable_color_overlay: true,
        gradient_cards: false,
        dark_mode: true,
        dark_preset: {
          'background-0': '#030203',
          'background-1': '#030203',
          'background-2': '#262626',
          borders: '#030203',
          links: '#c6a4d6',
          sidebar:
            'linear-gradient(#000000c7, #000000c7), center url("https://i.pinimg.com/originals/5f/57/dd/5f57dd7333316b0c8caf1d048e75d901.gif")',
          'sidebar-text': '#f5f5f5',
          'text-0': '#efddf8',
          'text-1': '#fcfcf7',
          'text-2': '#ababab',
        },
        custom_cards: [
          'https://i.pinimg.com/736x/79/47/22/794722ef99e3d46c522732af03efc13d.jpg',
          'https://i.pinimg.com/736x/6b/6b/cc/6b6bccd3f1eb0e15b774a0d9f86d4c5d.jpg',
          'https://i.pinimg.com/736x/64/a7/30/64a730bb21506b263cf547820deea5b5.jpg',
          'https://i.pinimg.com/736x/aa/bc/c2/aabcc2f97744d2fac4049106a268639e.jpg',
        ],
        card_colors: ['#d2f1e4', '#fbcaef', '#fdf4b4', '#9fe8fc'],
        custom_font: { family: "'DM Sans'", link: 'DM+Sans:wght@400;700' },
      },
      preview:
        'https://i.pinimg.com/736x/6b/6b/cc/6b6bccd3f1eb0e15b774a0d9f86d4c5d.jpg',
    },

    /*
        { "title": "Motivational by Adrianna", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#202020", "background-1": "#2e2e2e", "background-2": "#4e4e4e", "borders": "#404040", "links": "#56Caf0", "sidebar": "#2e2e2e", "sidebar-text": "#f5f5f5", "text-0": "#f5f5f5", "text-1": "#e2e2e2", "text-2": "#ababab" }, "custom_cards": ["https://i.pinimg.com/474x/1d/3a/0e/1d3a0e1b3543d873cf8de35a2911c03f.jpg", "https://i.pinimg.com/474x/dd/e8/27/dde8279847d6f508b426a094a5aac28a.jpg", "https://i.pinimg.com/474x/ee/b4/60/eeb4601e423baccb5a8e5f091ec8cc9f.jpg", "https://i.pinimg.com/474x/9a/9f/e3/9a9fe35de7a80fb8cc3079167c2b01a8.jpg", "https://i.pinimg.com/474x/eb/37/af/eb37afabc5d1f0138c7ba5a1810158ea.jpg", "https://i.pinimg.com/474x/63/66/dd/6366dd0b47728a60f1d81262ab618724.jpg", "https://i.pinimg.com/474x/13/47/96/13479630adf41bc42c4b542590282526.jpg"], "card_colors": ["#000000"], "custom_font": { "family": "'Open Sans'", "link": "Open+Sans:wght@400;700" } }, "preview": "https://i.pinimg.com/474x/1d/3a/0e/1d3a0e1b3543d873cf8de35a2911c03f.jpg" },
        { "title": "Chainsaw by Mykol", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#0f0f0f", "background-1": "#0c0c0c", "background-2": "#141414", "borders": "#1e1e1e", "links": "#f49e0b", "sidebar": "#0c0c0c", "sidebar-text": "#f5f5f5", "text-0": "#f5f5f5", "text-1": "#e2e2e2", "text-2": "#ababab" }, "custom_cards": ["https://pbs.twimg.com/media/FjCyGhvXwAAjFqn.jpg", "https://w.wallhaven.cc/full/dp/wallhaven-dpvd2g.jpg", "https://i.pinimg.com/originals/31/3e/57/313e570a0cf1493790669461d65b7137.jpg", "https://i.ytimg.com/vi/5SdHEv04Wic/maxresdefault.jpg", "https://pbs.twimg.com/media/E5htXu2WEAM4WiL.jpg"], "card_colors": ["#e36d0d"], "custom_font": { "family": "'Rubik'", "link": "Rubik:wght@400;700" } }, "preview": "https://i.pinimg.com/originals/31/3e/57/313e570a0cf1493790669461d65b7137.jpg" },
        { "title": "LeonK by BlancaC", "exports": { "disable_color_overlay": false, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#232425", "background-1": "#1e1e1e", "background-2": "#262626", "borders": "#4e1313", "links": "#e255b5", "sidebar": "linear-gradient(#b88ea5c7, #6b0a3ec7), center url(\"https://i.pinimg.com/736x/71/a7/b1/71a7b19b26616a7e54c802b8ae898080.jpg\")", "sidebar-text": "#fdd3e7", "text-0": "#f5f5f5", "text-1": "#e2e2e2", "text-2": "#ababab" }, "custom_cards": ["https://i.pinimg.com/736x/d4/a1/6e/d4a16ee82c8e45ffbc03611808ec3202.jpg", "https://i.pinimg.com/474x/ab/fc/50/abfc50beea6f05c428a0a42c415d1a2b.jpg", "https://i.pinimg.com/736x/11/d9/22/11d92290bd92f6719e687f86a734db3d.jpg", "https://game.capcom.com/residentevil/pc/img/umbrella/20230324/utu1_31-1.jpg", "https://cdn.vox-cdn.com/thumbor/Og1IT6M5rO4C_z3eIodSjBB6P-o=/0x0:2854x1560/1200x0/filters:focal(0x0:2854x1560):no_upscale()/cdn.vox-cdn.com/uploads/chorus_asset/file/24774139/5.Leon.Culp.jpg", "https://i.pinimg.com/236x/07/08/80/0708805a022e79d7dbd8077bba877a8d.jpg", "https://www.svg.com/img/gallery/the-worst-things-resident-evils-leon-kennedy-has-ever-done/intro-1657287618.jpg", "https://preview.redd.it/leon-kennedy-is-absurdly-attractive-in-resident-evil-4-v0-24o386br63ta1.jpg?width=640&crop=smart&auto=webp&s=29215993db324eec1a0c3153e6d442a2eca2d463", "https://i.pinimg.com/736x/3a/d0/e0/3ad0e09f1c249f5ea858564036d4ba6e.jpg"], "card_colors": ["#ff0a54", "#ff5c8a", "#ff85a1", "#ff99ac", "#fbb1bd", "#ff0a54", "#ff5c8a", "#ff85a1", "#ff99ac"], "custom_font": { "family": "'Tektur'", "link": "Tektur:wght@400;700" } }, "preview": "https://i.pinimg.com/236x/07/08/80/0708805a022e79d7dbd8077bba877a8d.jpg" },
        { "title": "Forest by Alia", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#272727", "background-1": "#353535", "background-2": "#404040", "borders": "#454545", "links": "#56Caf0", "sidebar": "#353535", "sidebar-text": "#f5f5f5", "text-0": "#f5f5f5", "text-1": "#e2e2e2", "text-2": "#ababab" }, "custom_cards": ["https://i.pinimg.com/originals/aa/33/d5/aa33d5bf71e6d8fdb050b1e104b7c437.gif", "https://i.pinimg.com/originals/eb/54/d4/eb54d4191a91f9ff3c2f9a198471136b.gif", "https://i.pinimg.com/originals/3b/a0/87/3ba0876e7f971ba78fb3b8b329003576.gif", "https://i.pinimg.com/originals/aa/33/d5/aa33d5bf71e6d8fdb050b1e104b7c437.gif"], "card_colors": ["#124229", "#3a4c40", "#b7b7a4"], "custom_font": { "family": "'Tektur'", "link": "Tektur:wght@400;700" } }, "preview": "https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQ-1LXVIfQ3A3B1QcRuF8DVHF13ekVFBrvd8MDD0eYPodDbVMcS" },
        { "title": "Neon by Gabriel", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#161616", "background-1": "#56c2bb", "background-2": "#4be285", "borders": "#00d0fa", "links": "#ff80ca", "sidebar": "linear-gradient(#6bd3e1, #fe6794)", "sidebar-text": "#f5f5f5", "text-0": "#9ae5fe", "text-1": "#ff7ac8", "text-2": "#70ffb5" }, "custom_cards": ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTwmWMKqKcq9-amzPxhVRVp9nBCk2_NmpK_g"], "card_colors": ["#975bc9"], "custom_font": { "family": "'Nova Script'", "link": "Nova Script:wght@400;700" } }, "preview": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTwmWMKqKcq9-amzPxhVRVp9nBCk2_NmpK_g" },
        { "title": "Gloomy by Simonii", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#272625", "background-1": "#282624", "background-2": "#1e1a1a", "borders": "#423e3e", "links": "#ebe0cb", "sidebar": "linear-gradient(#ffeed6c7, #000000c7), center url(\"https://i.imgur.com/RnMvKQi.png\")", "sidebar-text": "#2a1818", "text-0": "#ffffff", "text-1": "#d3c5c5", "text-2": "#f7cfcf" }, "custom_cards": ["https://i.pinimg.com/564x/e1/1b/9a/e11b9aafa1255e0ce3e3acedb1dc3b33.jpg", "https://i.pinimg.com/736x/0e/d6/49/0ed649ba78863b1fe7f98c2cc653c973.jpg", "https://i.pinimg.com/736x/82/c0/7a/82c07a11def29584bbc6889bebecdf8a.jpg", "https://i.pinimg.com/564x/13/75/0f/13750f212f7a3a6af876d74676048a35.jpg", "https://i.pinimg.com/564x/26/6c/80/266c802a6bdff40e22eb7801bd8c5907.jpg", "https://i.pinimg.com/564x/c6/5c/e5/c65ce551b92d7145950b3537405af2e1.jpg", "https://i.pinimg.com/564x/9f/4a/20/9f4a20e94c9c3a07497ba11d31a43a19.jpg", "https://i.pinimg.com/564x/82/80/91/828091620792f6bfb4ffabb4806d996d.jpg", "https://i.pinimg.com/564x/4d/52/8a/4d528a80011c92f3f075d05bd90c706e.jpg", "https://i.pinimg.com/564x/b1/d6/dd/b1d6dde245d5dff3abcdbc127fc6d68a.jpg", "https://i.pinimg.com/564x/40/fd/9e/40fd9ebcbdcc6ba289f8e991d74de01d.jpg", "https://i.pinimg.com/564x/64/cf/05/64cf059ba4e9bbb9b94aced1dc85e570.jpg"], "card_colors": ["#34fecb"], "custom_font": { "family": "'Nanum Myeongjo'", "link": "Nanum+Myeongjo:wght@400;700" } }, "preview": "https://i.pinimg.com/564x/4d/52/8a/4d528a80011c92f3f075d05bd90c706e.jpg" },
        { "title": "Vergil by nickolas", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#101010", "background-1": "#121212", "background-2": "#1a1a1a", "borders": "#272727", "links": "#db334c", "sidebar": "#121212", "sidebar-text": "#f5f5f5", "text-0": "#f5f5f5", "text-1": "#e2e2e2", "text-2": "#ababab" }, "custom_cards": ["https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMHgwYzd2eXU3cnc5ajY5bDZuODh6aGtzNnI4NG0yYzNxMDhsdTNndCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/ZRouJhQpbhPzTJ2eBU/giphy.gif", "https://media.giphy.com/media/uFxXhqkaGuhvzlOXNb/giphy.gif?cid=790b76110x0c7vyu7rw9j69l6n88zhks6r84m2c3q08lu3gt&ep=v1_gifs_search&rid=giphy.gif&ct=g", "https://media.giphy.com/media/9VtZa3W3UjmQgFTY4I/giphy.gif?cid=790b76110x0c7vyu7rw9j69l6n88zhks6r84m2c3q08lu3gt&ep=v1_gifs_search&rid=giphy.gif&ct=g", "https://media.giphy.com/media/KzQ8OChBq9EBSMf1f7/giphy.gif?cid=790b7611bhvvqwfl4oarmtqijtrb8zw4qx24bkhh5hxeg0wq&ep=v1_gifs_search&rid=giphy.gif&ct=g", "https://media.giphy.com/media/n1DsSMIPUO5TfUcpML/giphy.gif?cid=790b7611bhvvqwfl4oarmtqijtrb8zw4qx24bkhh5hxeg0wq&ep=v1_gifs_search&rid=giphy.gif&ct=g"], "card_colors": ["#c71f37"], "custom_font": { "family": "'Comfortaa'", "link": "Comfortaa:wght@400;700" } }, "preview": "https://i.pinimg.com/236x/90/0a/d6/900ad68e98b661ed72d9260639bd06b0.jpg" },
        { "title": "Folklore by Amy", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#202020", "background-1": "#2e2e2e", "background-2": "#4e4e4e", "borders": "#404040", "links": "#050505", "sidebar": "#2e2e2e", "sidebar-text": "#f5f5f5", "text-0": "#f5f5f5", "text-1": "#e2e2e2", "text-2": "#ababab" }, "custom_cards": ["https://i.pinimg.com/564x/3a/92/15/3a921570cd8d200a36b596f169c86c9e.jpg", "https://i.pinimg.com/236x/74/31/e7/7431e7f2739bed4af436cb13909992ae.jpg", "https://i.pinimg.com/564x/e4/73/7f/e4737f38dca2411bd4e4e0ce90332b2d.jpg", "https://i.pinimg.com/564x/c6/40/70/c640701406c3b0c82897622a25336240.jpg", "https://i.pinimg.com/564x/47/4f/28/474f2814fd9e3d33db4a02cb477fc735.jpg", "https://i.pinimg.com/564x/c1/bf/34/c1bf34a8e0a257eb24727de4930b1797.jpg"], "card_colors": ["#e7e6f7", "#e3d0d8", "#aea3b0", "#827081", "#c6d2ed", "#e7e6f7", "#e3d0d8", "#aea3b0", "#827081", "#c6d2ed", "#e7e6f7"], "custom_font": { "family": "'https'", "link": "https:wght@400;700" } }, "preview": "https://i.pinimg.com/564x/3a/92/15/3a921570cd8d200a36b596f169c86c9e.jpg" },
        { "title": "Pagani by Samuel", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#292929", "background-1": "#4f4f4f", "background-2": "#757575", "borders": "#000000", "links": "#498092", "sidebar": "linear-gradient(#a8a4a4c7, #4d4d4dc7), center url(\"https://static1.hotcarsimages.com/wordpress/wp-content/uploads/2019/08/Pagani-Zonda-Cinque.jpg\")", "sidebar-text": "#f5f5f5", "text-0": "#f5f5f5", "text-1": "#c2c2c2", "text-2": "#ababab" }, "custom_cards": ["https://cdn.carbuzz.com/gallery-images/840x560/274000/800/274822.jpg", "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Pagani_Utopia.jpg/1200px-Pagani_Utopia.jpg", "https://www.motortrend.com/uploads/2021/09/Pagani-Huayra-BC-Roadster-02-1.jpg", "https://www.thesupercarblog.com/wp-content/uploads/2024/01/Worlds-First-Pagani-Imola-Roadster-delivery-Miami-1.jpg", "https://www.topgear.com/sites/default/files/2021/08/2010-Pagani-Zonda-R-Evolution-_0.jpg"], "card_colors": ["#808080"], "custom_font": { "family": "'Arimo'", "link": "Arimo:wght@400;700" } }, "preview": "https://cdn.carbuzz.com/gallery-images/840x560/274000/800/274822.jpg" },
        { "title": "ErasCollage by Mischa", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#242424", "background-1": "#10100f", "background-2": "#c0c1be", "borders": "#b7b4b4", "links": "#d5ebfa", "sidebar": "linear-gradient(#000000c7, #fffafac7), center url(\"https://i.pinimg.com/564x/f5/c8/90/f5c890a64b6292cda6d4a3d0ae34786f.jpg\")", "sidebar-text": "#f5f5f5", "text-0": "#d5ebfa", "text-1": "#d5ebfa", "text-2": "#d5ebfa" }, "custom_cards": ["https://i.pinimg.com/564x/7c/49/da/7c49da504872a5fccfe6be08e94febda.jpg", "https://i.pinimg.com/564x/c1/0e/20/c10e20f5939dab75acd0fb0f62b34802.jpg", "https://i.pinimg.com/564x/95/19/50/951950ff42de2d14e9903385b6939d90.jpg", "https://i.pinimg.com/564x/9a/a7/60/9aa7602bd830b39782e0b00b8c83bdf3.jpg", "https://i.pinimg.com/736x/34/5d/7b/345d7b6cc57bbfef5c67eb6856c384c4.jpg", "https://i.pinimg.com/564x/07/48/3a/07483a17eb75ce865224f6fc32bfa088.jpg", "https://i.pinimg.com/564x/39/14/58/3914582877119d1083ab03110d35e7a6.jpg", "https://i.pinimg.com/564x/6b/44/ff/6b44ff3676d1258ce1ce7c6037d28a2d.jpg", "https://i.pinimg.com/564x/07/87/29/0787291b871e258b93ed5d450d3f1335.jpg", "https://i.pinimg.com/564x/92/60/0c/92600cc851649e783915a9282cb0ed5f.jpg", "https://i.pinimg.com/564x/d7/78/a0/d778a0bbe4f2b6cc1f96aaa933e4dc8c.jpg", "https://i.pinimg.com/564x/00/58/8f/00588f21bb0eeb306e7003bad7b9558f.jpg"], "card_colors": [], "custom_font": { "family": "'Inconsolata'", "link": "Inconsolata:wght@400;700" } }, "preview": "https://i.pinimg.com/564x/07/48/3a/07483a17eb75ce865224f6fc32bfa088.jpg" },
        { "title": "MoonKnight by Noor", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#212121", "background-1": "#2e2e2e", "background-2": "#4e4e4e", "borders": "#404040", "links": "#a9a793", "sidebar": "#171717", "sidebar-text": "#f5f5f5", "text-0": "#f5f5f5", "text-1": "#e2e2e2", "text-2": "#ababab" }, "custom_cards": ["https://i.pinimg.com/564x/35/58/0c/35580ceb64d50bc9c7f924ba26b6a7a4.jpg", "https://i.pinimg.com/564x/54/f3/93/54f393577f3f1f7fa96bcd828373573b.jpg", "https://i.pinimg.com/564x/ce/d6/1b/ced61bc49f5bcdf30eb7e71d3f79a980.jpg", "https://i.pinimg.com/564x/1d/cb/13/1dcb13cafea9e8d1267575917e200af2.jpg", "https://i.pinimg.com/564x/b8/b9/dd/b8b9ddb853ee33e649d5d3dfd42b281f.jpg", "https://i.pinimg.com/564x/40/f9/49/40f949cd72bce4d25f271f315926b88a.jpg", "https://i.pinimg.com/564x/4c/2b/44/4c2b44369bc68d1d142e4999679fea8d.jpg", "https://i.pinimg.com/564x/81/21/ab/8121ab3e3a0776e37c477fd00faa15b5.jpg"], "card_colors": ["#888777"], "custom_font": { "family": "'Cinzel'", "link": "Cinzel:wght@400;700" } }, "preview": "https://i.pinimg.com/564x/4c/2b/44/4c2b44369bc68d1d142e4999679fea8d.jpg" },
        { "title": "ItGrl by Pynk", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#161616", "background-1": "#6f0101", "background-2": "#262626", "borders": "#3c3c3c", "links": "#920202", "sidebar": "linear-gradient(#000000c7, #343232c7), center url(\"https://i.pinimg.com/564x/f8/1c/26/f81c26649e131265ad517212a5c4be91.jpg\")", "sidebar-text": "#9c0202", "text-0": "#ffffff", "text-1": "#ffffff", "text-2": "#ffffff" }, "custom_cards": ["https://i.pinimg.com/564x/a5/ba/00/a5ba00fdffb8bd4754c875001a6c3ec9.jpg", "https://i.pinimg.com/564x/04/c1/e3/04c1e37b8c15686b88c89f5ca32ccde8.jpg", "https://i.pinimg.com/736x/40/75/7e/40757e10a6da0b7d0e14a75e9b450d5f.jpg", "https://i.pinimg.com/564x/45/2e/3f/452e3f6f27f47c31881c08c6cc98677b.jpg", "https://i.pinimg.com/564x/bd/d8/7d/bdd87dc0eb6f8e67aa6c7406be57fa09.jpg", "https://i.pinimg.com/736x/c8/ed/69/c8ed691fb9a62379754aee57b611e655.jpg", "https://i.pinimg.com/564x/e6/b7/13/e6b713ab2884e6c519cfe8c4fd9b0938.jpg", "https://i.pinimg.com/564x/55/fc/94/55fc9403ae83b798943e11d86237dc65.jpg"], "card_colors": ["#e01e37", "#c71f37", "#b21e35", "#a11d33", "#6e1423", "#e01e37", "#c71f37", "#b21e35", "#a11d33"], "custom_font": { "family": "'Cinzel'", "link": "Cinzel:wght@400;700" } }, "preview": "https://i.pinimg.com/564x/a5/ba/00/a5ba00fdffb8bd4754c875001a6c3ec9.jpg" },
        { "title": "Snoopy by AJ", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#101010", "background-1": "#141414", "background-2": "#1a1a1a", "borders": "#5a6d5c", "links": "#91b196", "sidebar": "#5a6d5c", "sidebar-text": "#f5f5f5", "text-0": "#f5f5f5", "text-1": "#e2e2e2", "text-2": "#ababab" }, "custom_cards": ["https://i.pinimg.com/474x/e7/21/0b/e7210bfd30e17fd4342548d56ca78682.jpg", "https://i.pinimg.com/474x/48/ec/60/48ec6050058d7c29aa363e017dd572b4.jpg", "https://i.pinimg.com/474x/65/5a/f4/655af491cf19894e92e8c602a1e5f721.jpg", "https://i.pinimg.com/474x/9c/c3/86/9cc3866bc8030b15d361ab7ff2e4fd7e.jpg", "https://i.pinimg.com/474x/44/db/d8/44dbd8ce4e41e4d6768c7923fd6e8b09.jpg", "https://i.pinimg.com/474x/b0/1f/f3/b01ff39b649dbe760c8ae1094df98730.jpg", "https://i.pinimg.com/474x/4b/54/62/4b5462b41072c561175924a4a0e5c194.jpg", "https://i.pinimg.com/474x/82/90/1d/82901d12a3e380d3e974bfef719b5919.jpg", "https://i.pinimg.com/474x/d7/91/53/d79153d4c7d8d18f6008e017c013962e.jpg"], "card_colors": ["#91b196"], "custom_font": { "family": "", "link": "" } }, "preview": "https://i.pinimg.com/474x/4b/54/62/4b5462b41072c561175924a4a0e5c194.jpg" },
        { "title": "Ferrari by Vincent", "exports": { "disable_color_overlay": false, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#101010", "background-1": "#121212", "background-2": "#1a1a1a", "borders": "#272727", "links": "#d60000", "sidebar": "#121212", "sidebar-text": "#f5f5f5", "text-0": "#f5f5f5", "text-1": "#e2e2e2", "text-2": "#ababab" }, "custom_cards": ["https://64.media.tumblr.com/5afa537025ecf339d036e3e4c40bb789/ebc602d9ff1556c2-e5/s500x750/96ff3e448a20a3860df586216424a38a9e6005d3.gif", "https://i.pinimg.com/originals/77/f5/58/77f5586fe7b43e5014ddf36ccb6ecca5.gif", "https://robbreport.com/wp-content/uploads/2022/11/f5005.jpg", "https://i.pinimg.com/originals/84/6f/c1/846fc1ef071081e340203d03ce0a659c.gif", "https://robbreport.com/wp-content/uploads/2020/04/1-18.jpg?w=1000"], "card_colors": ["#d00000", "#cb0000", "#c60000", "#c10000", "#bc0000"], "custom_font": { "family": "'Oswald'", "link": "Oswald:wght@400;700" } }, "preview": "https://robbreport.com/wp-content/uploads/2020/04/1-18.jpg?w=1000" },
        { "title": "Lana by G!llnm", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#272727", "background-1": "#f570be", "background-2": "#feb4df", "borders": "#f570be", "links": "#f570be", "sidebar": "#f570be", "sidebar-text": "#ffffff", "text-0": "#fbe5f2", "text-1": "#ffc2e5", "text-2": "#ffd1ec" }, "custom_cards": ["https://i.pinimg.com/236x/d2/21/2f/d2212f198ab82da0646f879e13119c43.jpg", "https://i.pinimg.com/236x/72/58/ff/7258ff2ccae2c84e49e4a426c1ef48f1.jpg", "https://i.pinimg.com/736x/5d/8b/c6/5d8bc614d74968331aa140472cc0f263.jpg", "https://i.pinimg.com/736x/46/1b/2e/461b2e238350207a66453d56573c4a64.jpg", "https://i.pinimg.com/564x/d5/8e/11/d58e11500934d54481e805b32d46f049.jpg", "https://i.pinimg.com/736x/ab/8b/e3/ab8be3c609b511b7c5a6a290cc4bd7f6.jpg"], "card_colors": ["#f570be"], "custom_font": { "family": "'Jost'", "link": "Jost:wght@400;700" } }, "preview": "https://i.pinimg.com/236x/72/58/ff/7258ff2ccae2c84e49e4a426c1ef48f1.jpg" },
        { "title": "toroinoue by cheerios", "exports": { "disable_color_overlay": false, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#3c3c3c", "background-1": "#262626", "background-2": "#262626", "borders": "#dce9fc", "links": "#FEC5BB", "sidebar": "#dce9fc", "sidebar-text": "#161616", "text-0": "#dce9fc", "text-1": "#dce9fc", "text-2": "#ababab" }, "custom_cards": ["https://i.pinimg.com/564x/a7/7c/36/a77c363a2aa28a7f37a63b4f9e08a3a6.jpg", "https://i.pinimg.com/564x/27/2e/e9/272ee9c495377b9ad991661b58d1f83b.jpg", "https://i.pinimg.com/564x/85/0d/a2/850da2f2fe8c2cda43a67d9dd9a1112d.jpg", "https://i.pinimg.com/564x/55/38/2b/55382b4f53134077ec51de976c9b6138.jpg", "https://i.pinimg.com/564x/2f/1a/6a/2f1a6a55e983c89787b2c0aa574ba1f9.jpg", "https://i.pinimg.com/564x/c1/cd/ff/c1cdffa1a06c6f1f11c34d568b41909a.jpg", "https://i.pinimg.com/564x/d8/12/02/d81202e4d1fbe4849440f475bf139a5a.jpg", "https://i.pinimg.com/564x/92/ce/d5/92ced51467bf37f40cf1330fad756352.jpg", "https://i.pinimg.com/564x/d7/37/22/d73722fdc504b7152ad401613485e076.jpg", "https://i.pinimg.com/564x/05/0a/bf/050abf66c2fde3e7bb733bc018fcec8c.jpg"], "card_colors": ["#cddafd", "#fffae5", "#e2ece9", "#d6e2e9", "#fde2e4", "#f0efeb", "#fff1e6", "#610345", "#bee1e6", "#dfe7fd", "#fad2e1"], "custom_font": { "family": "'Kanit'", "link": "Kanit:wght@400;700" } }, "preview": "https://i.pinimg.com/564x/a7/7c/36/a77c363a2aa28a7f37a63b4f9e08a3a6.jpg" },
        { "title": "MercedesF1 by Ryan", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#161616", "background-1": "#000000", "background-2": "#000000", "borders": "#ffffff", "links": "#64ebed", "sidebar": "#64ebed", "sidebar-text": "#000000", "text-0": "#ffffff", "text-1": "#ffffff", "text-2": "#ffffff" }, "custom_cards": ["https://speedcafe.us/wp-content/uploads/M409049.jpg_20241501_12x8.jpg", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0R1mS8Ls3axH-cdn4NMoFLo_KHaxVVV-s2w&usqp=CAU", "https://www.si.com/.image/ar_16:9%2Cc_fill%2Ccs_srgb%2Cfl_progressive%2Cg_faces:center%2Cq_auto:good%2Cw_768/MTk2NjI5MDY4NjkzNzEwODE1/m359635.jpg", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-RxbYRY45JyHlb-PlTvfCBXB20kuabVEDoQ&usqp=CAU", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDSTgAFEuLs8PrWhC5ZLl1nZewWA5dY7qrmA&usqp=CAU", "https://media.cnn.com/api/v1/images/stellar/prod/221113195421-george-russell-celebrate-brazil-gp-2.jpg?c=original"], "card_colors": ["#00ffff"], "custom_font": { "family": "'Karla'", "link": "Karla:wght@400;700" } }, "preview": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR0R1mS8Ls3axH-cdn4NMoFLo_KHaxVVV-s2w&usqp=CAU" },
        { "title": "HTGAWM by Mechiel", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#161616", "background-1": "#212121", "background-2": "#262626", "borders": "#ff3333", "links": "#ff3333", "sidebar": "#1e1e1e", "sidebar-text": "#f5f5f5", "text-0": "#ffffff", "text-1": "#ffffff", "text-2": "#ffffff" }, "custom_cards": ["https://i.pinimg.com/564x/77/70/ae/7770ae5b6a4c4ca591d8ef6b74944aef.jpg", "https://i.pinimg.com/564x/ec/4f/ef/ec4fefc85d7639316671418c02321044.jpg", "https://i.pinimg.com/564x/d7/27/ff/d727ff8eef52d4e5c52478657c8d48c7.jpg", "https://i.pinimg.com/564x/40/09/73/4009736649e9d5ff79ca0473af4c17ea.jpg", "https://i.pinimg.com/564x/09/80/40/0980404ccf0de49ed7d85891f0532cbf.jpg", "https://i.pinimg.com/564x/a4/b8/3f/a4b83f899ce693f1fd9d2b14048c5306.jpg", "https://i.pinimg.com/736x/84/cb/52/84cb525fcee2455711aa0c359897d946.jpg", "https://i.pinimg.com/564x/d1/bb/cc/d1bbccbb76f20912716c99dd4536e188.jpg", "https://i.pinimg.com/564x/aa/ad/e5/aaade5083aedc59ba681318d369338a3.jpg"], "card_colors": ["#ff3333"], "custom_font": { "family": "'Cinzel'", "link": "Cinzel:wght@400;700" } }, "preview": "https://i.pinimg.com/564x/77/70/ae/7770ae5b6a4c4ca591d8ef6b74944aef.jpg" },
        { "title": "F1 by Max", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#161616", "background-1": "#1e1e1e", "background-2": "#262626", "borders": "#3c3c3c", "links": "#19a4a7", "sidebar": "#19a4a7", "sidebar-text": "#000000", "text-0": "#f5f5f5", "text-1": "#e2e2e2", "text-2": "#ababab" }, "custom_cards": ["https://i.pinimg.com/564x/71/cd/11/71cd1147f3db16a4d8e9e1a04cb6ee83.jpg", "https://i.pinimg.com/564x/53/cb/1a/53cb1a849f93a52e5f9e622bfaf39e3b.jpg", "https://i.pinimg.com/564x/ef/f6/37/eff6376ec893df6b023b67eb43b12aa6.jpg", "https://i.pinimg.com/564x/6c/32/0d/6c320d77a25507c9335540ee5e590375.jpg"], "card_colors": ["#19a4a7"], "custom_font": { "family": "'Rubik'", "link": "Rubik:wght@400;700" } }, "preview": "https://i.pinimg.com/564x/53/cb/1a/53cb1a849f93a52e5f9e622bfaf39e3b.jpg" },
        { "title": "OSU by Anonymous", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#232323", "background-1": "#353535", "background-2": "#404040", "borders": "#454545", "links": "#FCB0BF", "sidebar": "linear-gradient(#666666, #BB0000)", "sidebar-text": "#f5f5f5", "text-0": "#f5f5f5", "text-1": "#e2e2e2", "text-2": "#ababab" }, "custom_cards": ["https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Ohio_State_Buckeyes_logo.svg/350px-Ohio_State_Buckeyes_logo.svg.png", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfyXvEJvF2uqkWj4BlCu6twOgF9Fyf4ESZ0iBEcfwVog&s", "https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Ohio_State_University_Logo.svg/2048px-Ohio_State_University_Logo.svg.png", "https://content.sportslogos.net/logos/33/791/full/ohio_state_buckeyes_logo_alt_on_dark_1973_sportslogosnet-8881.png", "https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Ohio_State_University_seal.svg/300px-Ohio_State_University_seal.svg.png"], "card_colors": ["#ffffff", "#000000", "#ffffff", "#000000", "#ffffff", "#000000"], "custom_font": { "family": "", "link": "" } }, "preview": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Ohio_State_Buckeyes_logo.svg/350px-Ohio_State_Buckeyes_logo.svg.png" },
        { "title": "F1Teams by EthanF1", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#000000", "background-1": "#000000", "background-2": "#000000", "borders": "#000000", "links": "#a30000", "sidebar": "linear-gradient(#000000c7, #000000c7), center url(\"https://i.pinimg.com/564x/4f/5f/5e/4f5f5e140f1911e54e3cd761316ba12f.jpg\")", "sidebar-text": "#ffffff", "text-0": "#f5f5f5", "text-1": "#e2e2e2", "text-2": "#ababab" }, "custom_cards": ["https://media.licdn.com/dms/image/C4E22AQGOYToW8jpiXg/feedshare-shrink_800/0/1672766140689?e=2147483647&v=beta&t=yYd65eO2aFw034AenJFrUWO_QXoBCwvE4EA2rO-8jwk", "https://preview.redd.it/i-made-a-team-mclaren-poster-for-the-2023-japanese-gp-v0-v3f68vnkfxqb1.jpg?width=640&crop=smart&auto=webp&s=350cbe264dc5090d9b6893d2bfc19433eb188670", "https://i.ebayimg.com/images/g/7QsAAOSwdmZgliA-/s-l1200.webp", "https://m.media-amazon.com/images/I/71DvgAmPErL._AC_UF1000,1000_QL80_.jpg", "https://media.formula1.com/content/dam/fom-website/sutton/2022/Brazil/Friday/1440803811.jpg.img.1536.high.jpg", "https://f1i.com/wp-content/uploads/2019/05/Leclerc.jpg"], "card_colors": ["#737373"], "custom_font": { "family": "'Oswald'", "link": "Oswald:wght@400;700" } }, "preview": "https://preview.redd.it/i-made-a-team-mclaren-poster-for-the-2023-japanese-gp-v0-v3f68vnkfxqb1.jpg?width=640&crop=smart&auto=webp&s=350cbe264dc5090d9b6893d2bfc19433eb188670" },
        { "title": "Nissan by Liam", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#161616", "background-1": "#000000", "background-2": "#000000", "borders": "#ffffff", "links": "#FFFFFF", "sidebar": "linear-gradient(#444444, #666666)", "sidebar-text": "#FFFFFF", "text-0": "#ffffff", "text-1": "#ffffff", "text-2": "#ffffff" }, "custom_cards": ["https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSv4oFXZSsltT7xSg8aZU5R74DymUJC4nkxCKBLzaS9eA&s", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIxIakUUlyRafvQKZOvtIVuG7Qe3qmoS0NGy7jIHpijA&s", "https://external-preview.redd.it/ue-XAfuEpbd7NrTtj-Zob-8eXwzujyznSDcD6JMJAPs.jpg?auto=webp&s=5e5d16c91996d363fd99952644aa6a10d36063cf", "https://i.pinimg.com/originals/e3/68/60/e36860e156dd107ef34b14f87ca7291c.jpg", "https://i.redd.it/t6joqp50rre31.jpg", "https://pbs.twimg.com/media/Dwvvc2vX0AEwb7k.jpg:large", "https://i.pinimg.com/originals/82/1b/c3/821bc384d1cbba06159f2b4129fee4da.jpg", "https://i.pinimg.com/originals/65/44/de/6544deb27eebee16358f635b5fd84e85.jpg"], "card_colors": ["#FFFFFF"], "custom_font": { "family": "'Varela'", "link": "Varela:wght@400;700" } }, "preview": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQIxIakUUlyRafvQKZOvtIVuG7Qe3qmoS0NGy7jIHpijA&s" },
        { "title": "BMW by Hamza", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#403f3f", "background-1": "#000000", "background-2": "#020061", "borders": "#020061", "links": "#ffffff", "sidebar": "linear-gradient(#000000, #000875)", "sidebar-text": "#ffffff", "text-0": "#4a47ff", "text-1": "#ffffff", "text-2": "#ffffff" }, "custom_cards": ["https://i.ytimg.com/vi/w5nvqBdM-go/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCFMhh2O5WRww1rN1vQSMepz3eTPA", "https://www.keepyourcarsafe.co.uk/cdn/shop/products/DSC_0710_d0c3b229-b2b2-4888-8009-19beb0af2133_1946x.jpg?v=1609605860", "https://image-cdn.hypb.st/https%3A%2F%2Fhypebeast.com%2Fimage%2F2022%2F01%2Fmanhart-mh8-800-limited-01-10-bmw-m8-competition-v8-tuned-rare-german-super-coupe-3.jpg?cbr=1&q=90", "https://www.vegasautogallery.com/imagetag/512/29/l/Used-2020-BMW-M5-Competition-1614113063.jpg", "https://cloudfront-us-east-2.images.arcpublishing.com/reuters/U6DU4EGVOZNXPHXTMIPF7B5C64.jpg"], "card_colors": ["#171717"], "custom_font": { "family": "'Montserrat'", "link": "Montserrat:wght@400;700" } }, "preview": "https://i.ytimg.com/vi/w5nvqBdM-go/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLCFMhh2O5WRww1rN1vQSMepz3eTPA" },
        { "title": "RainyDay by CMHEIK", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#161616", "background-1": "#1e1e1e", "background-2": "#262626", "borders": "#3c3c3c", "links": "#A3B18A", "sidebar": "#496E4C", "sidebar-text": "#DAD7CD", "text-0": "#DAD7CD", "text-1": "#DAD7CD", "text-2": "#DAD7CD" }, "custom_cards": ["https://cdn.kibrispdr.org/data/1755/anime-rain-gif-50.gif", "https://i.pinimg.com/originals/65/8d/8e/658d8eb90b08dcf7c18c7a7cfba2ea50.gif", "https://i.pinimg.com/originals/dd/54/b7/dd54b7ddc13906fbb8b5e97ab6c3f119.gif", "https://i.imgur.com/fpTddbw.gif", "https://i.redd.it/ux93fxldhoxa1.gif", "https://64.media.tumblr.com/4d8dd5743f454682d3d03303dba81eb8/tumblr_p5lt9dnoOO1uhx88zo1_500.gif", "https://img.wattpad.com/145da2e6f66d74c429ebe8baff51887bf408c2d5/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f6358354a334c6234355a343150513d3d2d313135333131393938302e313665346432313634333930363166353830343432343937343930382e676966"], "card_colors": ["#344e41", "#375441", "#588157", "#496e4c", "#3a5a40", "#a3b18a", "#7e9971"], "custom_font": { "family": "", "link": "" } }, "preview": "https://img.wattpad.com/145da2e6f66d74c429ebe8baff51887bf408c2d5/68747470733a2f2f73332e616d617a6f6e6177732e636f6d2f776174747061642d6d656469612d736572766963652f53746f7279496d6167652f6358354a334c6234355a343150513d3d2d313135333131393938302e313665346432313634333930363166353830343432343937343930382e676966" },
        { "title": "TTPD by Brody", "exports": { "disable_color_overlay": false, "gradient_cards": false, "dark_mode": true, "dark_preset": { "background-0": "#272727", "background-1": "#353535", "background-2": "#404040", "borders": "#454545", "links": "#56Caf0", "sidebar": "#353535", "sidebar-text": "#f5f5f5", "text-0": "#f5f5f5", "text-1": "#e2e2e2", "text-2": "#ababab" }, "custom_cards": ["https://assets.teenvogue.com/photos/65e5e30bb3acbf1a5964e0cf/16:9/w_1280,c_limit/431129483_288082554301322_5338342243495667848_n%20(1).jpg", "https://preview.redd.it/the-tortured-poets-department-the-albatross-edition-v0-bgnc9ahvackc1.jpg?width=640&crop=smart&auto=webp&s=1bfd5edbd540e1c8b52aa59ee0209b14d3482831", "https://www.mdtech.news/u/fotografias/m/2024/2/9/f768x400-36910_80813_20.png", "https://i0.wp.com/www.marieclaire.com.au/wp-content/uploads/sites/5/2024/02/taylor-swift-the-tortured-poets-department-track-listing-explained.jpg?fit=1920%2C1080&ssl=1", "https://vipertimes.com/wp-content/uploads/2024/02/CWIUdn3xdTyXWyirAKD1FOJeBwiNfVp56HYvXM0B.png", "https://www.comingsoon.net/wp-content/uploads/sites/3/2024/02/taylor-swift-Tortured-Poets-Department-release-party-dates-when-how-to-get-tickets.jpg", "https://variety.com/wp-content/uploads/2024/02/Screenshot-2024-02-16-at-3.41.29-AM.png?w=1017", "https://lorena.r7.com/public/assets/img/postagens/post_58061.jpg", "https://wegotthiscovered.com/wp-content/uploads/2024/02/Taylor-Swift-Tortured-Poets-Department-2.jpg"], "card_colors": ["#767676"], "custom_font": { "family": "'Cinzel'", "link": "Cinzel:wght@400;700" } }, "preview": "https://vipertimes.com/wp-content/uploads/2024/02/CWIUdn3xdTyXWyirAKD1FOJeBwiNfVp56HYvXM0B.png" },

        { "title": "Crocodile by Samira", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": false, "custom_cards": ["https://i.pinimg.com/originals/6f/1e/62/6f1e6295d79f2e18fff6fc0709d884a5.jpg", "https://i.pinimg.com/originals/3d/2e/ac/3d2eacffd5d9204bbf4801ad55107ce7.jpg", "https://i.pinimg.com/originals/76/96/a1/7696a129f91b51b93939be66e4342c44.jpg", "https://i.pinimg.com/originals/01/7c/49/017c4904ab5ab0390bed9db63932dfd9.jpg", "https://i.pinimg.com/originals/33/8d/79/338d79861a7274cb60b456d3448ad98f.jpg"], "card_colors": ["#286914", "#347723", "#408532", "#4d9341", "#59a050", "#65ae5f", "#71bc6e"], "custom_font": { "family": "'Happy Monkey'", "link": "Happy+Monkey:wght@400;700" } }, "preview": "https://i.pinimg.com/originals/76/96/a1/7696a129f91b51b93939be66e4342c44.jpg" },
        { "title": "Hutcherson by Rachel", "exports": { "disable_color_overlay": false, "gradient_cards": false, "dark_mode": false, "custom_cards": ["https://media1.tenor.com/m/b7PcCEZRv08AAAAC/josh-hutcherson.gif"], "card_colors": ["#e1d5d7", "#f06291", "#65499d", "#009688", "#0b9be3", "#ff2717", "#d97900"], "custom_font": { "family": "'Oswald'", "link": "Oswald:wght@400;700" } }, "preview": "https://media1.tenor.com/m/b7PcCEZRv08AAAAC/josh-hutcherson.gif" },
        { "title": "Bugs by Avery", "exports": { "disable_color_overlay": true, "gradient_cards": false, "dark_mode": false, "custom_cards": ["https://i.pinimg.com/564x/e4/0a/ef/e40aefac57a2318fdd89655c46c72edb.jpg", "https://i.pinimg.com/564x/f6/f2/eb/f6f2eb8fae2a1f1dd5fb0da549d7a9b4.jpg", "https://i.pinimg.com/564x/23/69/96/236996b8212a2141cb3d6f717fbce870.jpg", "https://i.pinimg.com/564x/ea/39/60/ea396036cfa456bcc86cb357adf0c899.jpg"], "card_colors": ["#f2f230", "#c2f261", "#91f291", "#61f2c2"], "custom_font": { "family": "'Corben'", "link": "Corben:wght@400;700" } }, "preview": "https://i.pinimg.com/564x/f6/f2/eb/f6f2eb8fae2a1f1dd5fb0da549d7a9b4.jpg" },
        { "title": "Affection by Maggie", "exports": { "disable_color_overlay": false, "gradient_cards": true, "dark_mode": false, "custom_cards": ["https://inasianspaces.files.wordpress.com/2024/01/itsuomi-charming-yuki-while-holding-tea-a-sign-of-affection-episode-3.png?w=1200", "https://i.imgur.com/teoUw5s.png", "https://i0.wp.com/anitrendz.net/news/wp-content/uploads/2023/10/asignofaffection_pv1screenshot.png", "https://i.imgur.com/teoUw5s.png", "https://rabujoi.files.wordpress.com/2024/01/soa41.jpg", "https://i.imgur.com/qcmICyR.png", "https://a.storyblok.com/f/178900/750x422/b8cde0dca4/a-sign-of-affection.jpg/m/filters:quality(95)format(webp)"], "card_colors": ["#cdb4db", "#ffc8dd", "#ffafcc", "#bde0fe", "#a2d2ff", "#cdb4db"], "custom_font": { "link": "Rakkas:wght@400;700", "family": "'Rakkas'" } }, "preview": "https://rabujoi.files.wordpress.com/2024/01/soa41.jpg" },
        */
  ];

  if (name === 'all') return themes;
  for (const theme in themes) if (theme.title === name) return theme;
  return {};
}

function importTheme(theme) {
  try {
    let keys = Object.keys(theme);
    let final = {};
    chrome.storage.sync.get('custom_cards', (sync) => {
      keys.forEach((key) => {
        switch (key) {
          case 'dark_preset':
            changeToPresetCSS(null, theme['dark_preset']);
            break;
          case 'card_colors':
            sendFromPopup('setcolors', theme['card_colors']);
            break;
          case 'custom_cards':
            if (theme['custom_cards'].length > 0) {
              let pos = 0;
              Object.keys(sync['custom_cards']).forEach((key) => {
                sync['custom_cards'][key].img = theme['custom_cards'][pos];
                pos = pos === theme['custom_cards'].length - 1 ? 0 : pos + 1;
              });
            }
            final['custom_cards'] = sync['custom_cards'];
            break;
          default:
            final[key] = theme[key];
            break;
        }
      });
      chrome.storage.sync.set(final);
    });
  } catch (e) {
    console.log(e);
  }
}

function updateCards(key, value) {
  chrome.storage.sync.get(['custom_cards'], (result) => {
    chrome.storage.sync.set(
      {
        custom_cards: {
          ...result['custom_cards'],
          [key]: { ...result['custom_cards'][key], ...value },
        },
      },
      () => {
        if (chrome.runtime.lastError) {
          displayAlert(
            true,
            'The data you\'re entering is exceeding the storage limit, so it won\'t save. Try using shorter links, and make sure to press "copy image address" and not "copy image" for links.',
          );
        }
      },
    );
  });
}

function displayCustomFont() {
  chrome.storage.sync.get(['custom_font'], (storage) => {
    let el = document.querySelector('.custom-font');
    let linkContainer =
      document.querySelector('.custom-font-flex') ||
      makeElement('div', el, { className: 'custom-font-flex' });
    linkContainer.innerHTML =
      '<span>https://fonts.googleapis.com/css2?family=</span><input class="card-input" id="custom-font-link"></input>';
    let link = linkContainer.querySelector('#custom-font-link');
    link.value = storage.custom_font.link;

    link.addEventListener('change', function (e) {
      let linkVal = e.target.value.split(':')[0];
      let familyVal = linkVal.replace('+', ' ');
      linkVal += linkVal === '' ? '' : ':wght@400;700';
      familyVal = linkVal === '' ? '' : "'" + familyVal + "'";
      chrome.storage.sync.set({
        custom_font: { link: linkVal, family: familyVal },
      });
      link.value = linkVal;
    });

    const popularFonts = [
      'Arimo',
      'Barriecito',
      'Barlow',
      'Caveat',
      'Cinzel',
      'Comfortaa',
      'Corben',
      'DM Sans',
      'Expletus Sans',
      'Gluten',
      'Happy Monkey',
      'Inconsolata',
      'Inria Sans',
      'Jost',
      'Kanit',
      'Karla',
      'Kode Mono',
      'Lobster',
      'Lora',
      'Madimi One',
      'Mali',
      'Montserrat',
      'Nanum Myeongjo',
      'Open Sans',
      'Oswald',
      'Permanent Marker',
      'Playfair Display',
      'Poetsen One',
      'Poppins',
      'Quicksand',
      'Rakkas',
      'Redacted Script',
      'Roboto Mono',
      'Rubik',
      'Silkscreen',
      'Sixtyfour',
      'Syne Mono',
      'Tektur',
      'Texturina',
      'Ysabeau Infant',
      'Yuji Syuku',
    ];
    let quickFonts = document.querySelector('#quick-fonts');
    quickFonts.textContent = '';
    let noFont = makeElement('button', quickFonts, {
      className: 'customization-button',
      textContent: 'None',
    });
    noFont.addEventListener('click', () => {
      chrome.storage.sync.set({ custom_font: { link: '', family: '' } });
      link.value = '';
    });
    popularFonts.forEach((font) => {
      let btn = makeElement('button', quickFonts, {
        className: 'customization-button',
        textContent: font,
      });
      btn.addEventListener('click', () => {
        let linkVal = font.replace(' ', '+') + ':wght@400;700';
        chrome.storage.sync.set({
          custom_font: { link: linkVal, family: "'" + font + "'" },
        });
        link.value = linkVal;
      });
    });
  });
}

function displayGPABounds() {
  chrome.storage.sync.get(['gpa_calc_bounds'], (storage) => {
    const order = [
      'A+',
      'A',
      'A-',
      'B+',
      'B',
      'B-',
      'C+',
      'C',
      'C-',
      'D+',
      'D',
      'D-',
      'F',
    ];
    const el = document.querySelector('.gpa-bounds');
    el.textContent = '';
    order.forEach((key) => {
      let inputs = makeElement('div', el, { className: 'gpa-bounds-item' });
      inputs.innerHTML +=
        '<div><span class="gpa-bounds-grade"></span><input class="gpa-bounds-input gpa-bounds-cutoff" type="text"></input><span style="margin-left:6px;margin-right:6px;">%</span><input class="gpa-bounds-input gpa-bounds-gpa" type="text" value=></input><span style="margin-left:6px">GPA</span></div>';
      inputs.querySelector('.gpa-bounds-grade').textContent = key;
      inputs.querySelector('.gpa-bounds-cutoff').value =
        storage['gpa_calc_bounds'][key].cutoff;
      inputs.querySelector('.gpa-bounds-gpa').value =
        storage['gpa_calc_bounds'][key].gpa;

      inputs
        .querySelector('.gpa-bounds-cutoff')
        .addEventListener('change', function (e) {
          chrome.storage.sync.get(['gpa_calc_bounds'], (existing) => {
            chrome.storage.sync.set({
              gpa_calc_bounds: {
                ...existing['gpa_calc_bounds'],
                [key]: {
                  ...existing['gpa_calc_bounds'][key],
                  cutoff: parseFloat(e.target.value),
                },
              },
            });
          });
        });

      inputs
        .querySelector('.gpa-bounds-gpa')
        .addEventListener('change', function (e) {
          chrome.storage.sync.get(['gpa_calc_bounds'], (existing) => {
            chrome.storage.sync.set({
              gpa_calc_bounds: {
                ...existing['gpa_calc_bounds'],
                [key]: {
                  ...existing['gpa_calc_bounds'][key],
                  gpa: parseFloat(e.target.value),
                },
              },
            });
          });
        });
    });
  });
}

let removeAlert = null;

function clearAlert() {
  clearTimeout(removeAlert);
  document.querySelector('#alert').style.bottom = '-400px';
}

function displayAlert(bad, msg) {
  clearTimeout(removeAlert);
  document.querySelector('#alert').style.bottom = '0';
  document.querySelector('#alert').textContent = msg;
  document.querySelector('#alert').style.background = bad
    ? '#e7495ed9'
    : '#468b46d9';
  removeAlert = setTimeout(() => {
    clearAlert();
  }, 15000);
}

function setCustomImage(key, val) {
  if (val !== '' && val !== 'none') {
    let test = new Image();
    test.onerror = () => {
      displayAlert(
        true,
        'It seems that the image link you provided isn\'t working. Make sure to right click on any images you want to use and select "copy image address" to get the correct link.',
      );

      // ensures storage limit error will override previous error
      updateCards(key, { img: val });
    };
    test.onload = clearAlert;
    test.src = val;
  }
  updateCards(key, { img: val });
}

function displayAdvancedCards() {
  sendFromPopup('getCards');
  chrome.storage.sync.get(['custom_cards', 'custom_cards_2'], (storage) => {
    document.querySelector('.advanced-cards').innerHTML =
      '<div id="advanced-current"></div><div id="advanced-past"><h2>Past Courses</h2></div>';
    const keys = storage['custom_cards']
      ? Object.keys(storage['custom_cards'])
      : [];
    if (keys.length > 0) {
      let currentEnrollment = keys.reduce(
        (max, key) =>
          storage['custom_cards'][key]?.eid > max
            ? storage['custom_cards'][key].eid
            : max,
        -1,
      );
      keys.forEach((key) => {
        let term = document.querySelector('#advanced-past');
        if (storage['custom_cards'][key].eid === currentEnrollment) {
          term = document.querySelector('#advanced-current');
        }
        let card = storage['custom_cards'][key];
        let card_2 = storage['custom_cards_2'][key] || {};
        if (!card || !card_2 || !card_2['links'] || card_2['links']['custom']) {
          console.log(key + ' error...');
          console.log(
            'card = ',
            card,
            'card_2',
            card_2,
            'links',
            card_2['links'],
          );
        } else {
          let container = makeElement('div', term, {
            className: 'custom-card',
          });
          container.classList.add('option-container');
          container.innerHTML =
            '<div class="custom-card-header"><p class="custom-card-title"></p><div class="custom-card-hide"><p class="custom-key">Hide</p></div></div><div class="custom-card-inputs"><div class="custom-card-left"><div class="custom-card-image"><span class="custom-key">Image</span></div><div class="custom-card-name"><span class="custom-key">Name</span></div><div class="custom-card-code"><span class="custom-key">Code</span></div></div><div class="custom-links-container"><p class="custom-key">Links</p><div class="custom-links"></div></div></div>';
          let imgInput = makeElement(
            'input',
            container.querySelector('.custom-card-image'),
            { className: 'card-input' },
          );
          let nameInput = makeElement(
            'input',
            container.querySelector('.custom-card-name'),
            { className: 'card-input' },
          );
          let codeInput = makeElement(
            'input',
            container.querySelector('.custom-card-code'),
            { className: 'card-input' },
          );
          let hideInput = makeElement(
            'input',
            container.querySelector('.custom-card-hide'),
            { className: 'card-input-checkbox' },
          );
          imgInput.placeholder = 'Image url';
          nameInput.placeholder = 'Custom name';
          codeInput.placeholder = 'Custom code';
          hideInput.type = 'checkbox';
          imgInput.value = card.img;
          nameInput.value = card.name;
          codeInput.value = card.code;
          hideInput.checked = card.hidden;
          if (card.img && card.img !== '')
            container.style.background =
              'linear-gradient(155deg, #1e1e1eeb 20%, #1e1e1ecc), url("' +
              card.img +
              '") center / cover no-repeat';
          imgInput.addEventListener('change', (e) => {
            setCustomImage(key, e.target.value);
            container.style.background =
              e.target.value === ''
                ? 'var(--containerbg)'
                : 'linear-gradient(155deg, #1e1e1eeb 20%, #1e1e1ecc), url("' +
                  e.target.value +
                  '") center / cover no-repeat';
          });
          nameInput.addEventListener('change', function (e) {
            updateCards(key, { name: e.target.value });
          });
          codeInput.addEventListener('change', function (e) {
            updateCards(key, { code: e.target.value });
          });
          hideInput.addEventListener('change', function (e) {
            updateCards(key, { hidden: e.target.checked });
          });
          container.querySelector('.custom-card-title').textContent =
            card.default;

          for (let i = 0; i < 4; i++) {
            let customLink = makeElement(
              'input',
              container.querySelector('.custom-links'),
              { className: 'card-input' },
            );
            customLink.value = card_2.links[i].is_default
              ? 'default'
              : card_2.links[i].path;
            customLink.addEventListener('change', function (e) {
              chrome.storage.sync.get('custom_cards_2', (storage) => {
                let newLinks = storage.custom_cards_2[key].links;
                if (e.target.value === '' || e.target.value === 'default') {
                  console.log('this value is empty....');
                  //newLinks[i] = { "type": storage.custom_cards_2[key].links.default[i].type, "default": true };
                  newLinks[i] = {
                    default: newLinks[i].default,
                    is_default: true,
                    path: newLinks[i].default,
                  };
                  customLink.value = 'default';
                } else {
                  //newLinks[i] = { "type": getLinkType(e.target.value), "path": e.target.value, "default": false };
                  let val = e.target.value;
                  if (
                    !e.target.value.includes('https://') &&
                    e.target.value !== 'none'
                  )
                    val = 'https://' + val;
                  newLinks[i] = {
                    default: newLinks[i].default,
                    is_default: false,
                    path: val,
                  };
                  customLink.value = val;
                }
                chrome.storage.sync.set({
                  custom_cards_2: {
                    ...storage.custom_cards_2,
                    [key]: { ...storage.custom_cards_2[key], links: newLinks },
                  },
                });
              });
            });
          }
        }
      });
    } else {
      document.querySelector(
        '.advanced-cards',
      ).innerHTML = `<div class="option-container"><h3>Couldn't find your cards!<br/>You may need to refresh your Canvas page and/or this menu page.<br/><br/>If you're having issues please contact me - ksucpea@gmail.com</h3></div>`;
    }
  });
}

/*
chrome.runtime.onMessage.addListener(message => {
    if (message === "getCardsComplete") {
        displayAdvancedCards();
    }
});
*/

/*
syncedSwitches.forEach(function (option) {
    let optionSwitch = document.querySelector('#' + option);
    chrome.storage.sync.get(option, function (result) {
        let status = result[option] === true ? "#on" : "#off";
        optionSwitch.querySelector(status).checked = true;
        optionSwitch.querySelector(status).classList.add('checked');
    });

    optionSwitch.querySelector(".slider").addEventListener('mouseup', function () {
        optionSwitch.querySelector("#on").checked = !optionSwitch.querySelector("#on").checked;
        optionSwitch.querySelector("#on").classList.toggle('checked');
        optionSwitch.querySelector("#off").classList.toggle('checked');
        let status = optionSwitch.querySelector("#on").checked;
        chrome.storage.sync.set({ [option]: status });
        if (option === "auto_dark") {
            toggleDarkModeDisable(status);
        }
    });
});
*/

/*
localSwitches.forEach(option => {
    let optionSwitch = document.querySelector('#' + option);
    chrome.storage.local.get(option, function (result) {
        let status = result[option] === true ? "#on" : "#off";
        optionSwitch.querySelector(status).checked = true;
        optionSwitch.querySelector(status).classList.add('checked');
    });
    optionSwitch.querySelector(".slider").addEventListener('mouseup', function () {
        optionSwitch.querySelector("#on").checked = !optionSwitch.querySelector("#on").checked;
        optionSwitch.querySelector("#on").classList.toggle('checked');
        optionSwitch.querySelector("#off").classList.toggle('checked');
        let status = optionSwitch.querySelector("#on").checked;
        chrome.storage.local.set({ [option]: status });

        /*
        switch (option) {
            case 'dark_mode': chrome.storage.local.set({ dark_mode: status }); sendFromPopup("darkmode"); break;
        }
        /
    });
});
*/

function toggleDarkModeDisable(disabled) {
  let darkSwitch = document.querySelector('#dark_mode');
  if (disabled === true) {
    darkSwitch.classList.add('switch_disabled');
    darkSwitch.style.pointerEvents = 'none';
  } else {
    darkSwitch.classList.remove('switch_disabled');
    darkSwitch.style.pointerEvents = 'auto';
  }
}

// customization tab

function getPalette(name) {
  const colors = {
    Blues: ['#ade8f4', '#90e0ef', '#48cae4', '#00b4d8', '#0096c7'],
    Reds: ['#e01e37', '#c71f37', '#b21e35', '#a11d33', '#6e1423'],
    Rainbow: ['#ff0000', '#ff5200', '#efea5a', '#3cf525', '#147df5', '#be0aff'],
    Candy: ['#cdb4db', '#ffc8dd', '#ffafcc', '#bde0fe', '#a2d2ff'],
    Purples: ['#e0aaff', '#c77dff', '#9d4edd', '#7b2cbf', '#5a189a'],
    Pastels: ['#fff1e6', '#fde2e4', '#fad2e1', '#bee1e6', '#cddafd'],
    Ocean: ['#22577a', '#38a3a5', '#57cc99', '#80ed99', '#c7f9cc'],
    Sunset: ['#eaac8b', '#e56b6f', '#b56576', '#6d597a', '#355070'],
    Army: ['#6b705c', '#a5a58d', '#b7b7a4', '#ffe8d6', '#ddbea9', '#cb997e'],
    Pinks: ['#ff0a54', '#ff5c8a', '#ff85a1', '#ff99ac', '#fbb1bd'],
    Watermelon: ['#386641', '#6a994e', '#a7c957', '#f2e8cf', '#bc4749'],
    Popsicle: ['#70d6ff', '#ff70a6', '#ff9770', '#ffd670', '#e9ff70'],
    Chess: ['#ffffff', '#000000'],
    Greens: ['#d8f3dc', '#b7e4c7', '#95d5b2', '#74c69d', '#52b788'],
    Fade: ['#ff69eb', '#ff86c8', '#ffa3a5', '#ffbf81', '#ffdc5e'],
    Oranges: ['#ffc971', '#ffb627', '#ff9505', '#e2711d', '#cc5803'],
    Mesa: ['#f6bd60', '#f28482', '#f5cac3', '#84a59d', '#f7ede2'],
    Berries: ['#4cc9f0', '#4361ee', '#713aed', '#9348c3', '#f72585'],
    Fade2: ['#f2f230', '#C2F261', '#91f291', '#61F2C2', '#30f2f2'],
    Muted: ['#E7E6F7', '#E3D0D8', '#AEA3B0', '#827081', '#C6D2ED'],
    Base: ['#e3b505', '#95190C', '#610345', '#107E7D', '#044B7F'],
    Fruit: ['#7DDF64', '#C0DF85', '#DEB986', '#DB6C79', '#ED4D6E'],
    Night: ['#25171A', '#4B244A', '#533A7B', '#6969B3', '#7F86C6'],
  };
  return colors[name] || [];
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? '0' + hex : hex;
}

function getColorInGradient(d, from, to) {
  let pat = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
  var exec1 = pat.exec(from);
  var exec2 = pat.exec(to);
  let a1 = [
    parseInt(exec1[1], 16),
    parseInt(exec1[2], 16),
    parseInt(exec1[3], 16),
  ];
  let a2 = [
    parseInt(exec2[1], 16),
    parseInt(exec2[2], 16),
    parseInt(exec2[3], 16),
  ];
  let rgb = a1.map((x, i) => Math.floor(a1[i] + d * (a2[i] - a1[i])));
  return (
    '#' +
    componentToHex(rgb[0]) +
    componentToHex(rgb[1]) +
    componentToHex(rgb[2])
  );
}

/*
function getColors(preset) {
    console.log(preset)
    Object.keys(preset).forEach(key => {
        try {
            let c = document.querySelector("#dp_" + key);
            let color = c.querySelector('input[type="color"]');
            let text = c.querySelector('input[type="text"]');
            [color, text].forEach(changer => {
                changer.value = preset[key];
                changer.addEventListener("change", function (e) {
                    changeCSS(key, e.target.value);
                });
            });
        } catch (e) {
            console.log("couldn't get " + key)
            console.log(e);
        }
    });
}
*/

/*
function getColors2(data) {
    const colors = data.split(":root")[1].split("--bcstop")[0];
    const backgroundcolors = document.querySelector("#option-background");
    const textcolors = document.querySelector("#option-text");
    colors.split(";").forEach(function (color) {
        const type = color.split(":")[0].replace("{", "").replace("}", "");
        const currentColor = color.split(":")[1];
        if (type) {
            let container = makeElement("div", "changer-container", type.includes("background") ? backgroundcolors : textcolors);
            let colorChange = makeElement("input", "card-input", container);
            let colorChangeText = makeElement("input", "card-input", container);
            colorChangeText.type = "text";
            colorChangeText.value = currentColor;
            colorChange.type = "color";
            colorChange.value = currentColor;
            [colorChange, colorChangeText].forEach(changer => {
                changer.addEventListener("change", function (e) {
                    changeCSS(type, e.target.value);
                });
            });
        }
    })
}
*/

function displaySidebarMode(mode, style) {
  style = style.replace(' ', '');
  let match = style.match(
    /linear-gradient\((?<color1>\#\w*),(?<color2>\#\w*)\)/,
  );
  let c1 = (c2 = '#000000');

  if (mode === 'image') {
    document.querySelector('#radio-sidebar-image').checked = true;
    document.querySelector('#sidebar-color2').style.display = 'flex';
    document.querySelector('#sidebar-image').style.display = 'flex';
    if (style.includes('url') && match) {
      if (match.groups.color1) c1 = match.groups.color1.replace('c7', '');
      if (match.groups.color2) c2 = match.groups.color2.replace('c7', '');
    }
    let url = style.match(/url\(\"(?<url>.*)\"\)/);
    document.querySelector('#sidebar-image input[type="text"]').value =
      url && url.groups.url ? url.groups.url : '';
  } else if (mode === 'gradient') {
    document.querySelector('#radio-sidebar-gradient').checked = true;
    document.querySelector('#sidebar-color2').style.display = 'flex';
    document.querySelector('#sidebar-image').style.display = 'none';
    if (!style.includes('url') && match) {
      if (match.groups.color1) c1 = match.groups.color1;
      if (match.groups.color2) c2 = match.groups.color2;
    }
  } else {
    document.querySelector('#radio-sidebar-solid').checked = true;
    document.querySelector('#sidebar-color2').style.display = 'none';
    document.querySelector('#sidebar-image').style.display = 'none';
    c1 = match ? '#000000' : style;
  }

  document.querySelector('#sidebar-color1 input[type="text"]').value = c1;
  document.querySelector('#sidebar-color1 input[type="color"]').value = c1;
  document.querySelector('#sidebar-color2 input[type="text"]').value = c2;
  document.querySelector('#sidebar-color2 input[type="color"]').value = c2;
}

let presetChangeTimeout = null;

chrome.storage.sync.get(['dark_preset'], (storage) => {
  let tab = document.querySelector('.customize-dark');
  Object.keys(storage['dark_preset']).forEach((key) => {
    if (key !== 'sidebar') {
      let c = tab.querySelector('#dp_' + key);
      let color = c.querySelector('input[type="color"]');
      let text = c.querySelector('input[type="text"]');
      [color, text].forEach((changer) => {
        changer.value = storage['dark_preset'][key];
        changer.addEventListener('input', function (e) {
          clearTimeout(presetChangeTimeout);
          presetChangeTimeout = setTimeout(
            () => changeCSS(key, e.target.value),
            200,
          );
        });
      });
    } else {
      let mode = storage['dark_preset'][key].includes('url')
        ? 'image'
        : storage['dark_preset'][key].includes('gradient')
        ? 'gradient'
        : 'solid';
      displaySidebarMode(mode, storage['dark_preset'][key]);
      let changeSidebar = () => {
        let c1 = tab
          .querySelector('#sidebar-color1 input[type="text"]')
          .value.replace('c7', '');
        let c2 = tab
          .querySelector('#sidebar-color2 input[type="text"]')
          .value.replace('c7', '');
        let url = tab.querySelector('#sidebar-image input[type="text"]').value;
        if (tab.querySelector('#radio-sidebar-image').checked) {
          changeCSS(
            key,
            `linear-gradient(${c1}c7, ${c2}c7), center url("${url}")`,
          );
        } else if (tab.querySelector('#radio-sidebar-gradient').checked) {
          changeCSS(key, `linear-gradient(${c1}, ${c2})`);
        } else {
          changeCSS(key, c1);
        }
      };
      ['#sidebar-color1', '#sidebar-color2'].forEach((group) => {
        ['input[type="text"]', 'input[type="color"]'].forEach((input) => {
          document
            .querySelector(group + ' ' + input)
            .addEventListener('input', (e) => {
              ['input[type="text"]', 'input[type="color"]'].forEach((i) => {
                document.querySelector(group + ' ' + i).value = e.target.value;
              });
              clearTimeout(presetChangeTimeout);
              presetChangeTimeout = setTimeout(() => changeSidebar(), 200);
            });
        });
      });
      document
        .querySelector('#sidebar-image input[type="text"')
        .addEventListener('change', () => changeSidebar());
    }
  });
});

function refreshColors() {
  chrome.storage.sync.get(['dark_preset'], (storage) => {
    Object.keys(storage['dark_preset']).forEach((key) => {
      let c = document.querySelector('#dp_' + key);
      let color = c.querySelector('input[type="color"]');
      let text = c.querySelector('input[type="text"]');
      color.value = storage['dark_preset'][key];
      text.value = storage['dark_preset'][key];
    });
    let mode = storage['dark_preset']['sidebar'].includes('url')
      ? 'image'
      : storage['dark_preset']['sidebar'].includes('gradient')
      ? 'gradient'
      : 'solid';
    displaySidebarMode(mode, storage['dark_preset']['sidebar']);
  });
}

function changeCSS(name, color) {
  chrome.storage.sync.get('dark_preset', (storage) => {
    storage['dark_preset'][name] = color;
    chrome.storage.sync
      .set({ dark_preset: storage['dark_preset'] })
      .then(() => refreshColors());
  });
}

function changeToPresetCSS(e, preset = null) {
  const presets = {
    'dark-lighter': {
      'background-0': '#272727',
      'background-1': '#353535',
      'background-2': '#404040',
      borders: '#454545',
      sidebar: '#353535',
      'text-0': '#f5f5f5',
      'text-1': '#e2e2e2',
      'text-2': '#ababab',
      links: '#56Caf0',
      'sidebar-text': '#f5f5f5',
    },
    'dark-light': {
      'background-0': '#202020',
      'background-1': '#2e2e2e',
      'background-2': '#4e4e4e',
      borders: '#404040',
      sidebar: '#2e2e2e',
      'text-0': '#f5f5f5',
      'text-1': '#e2e2e2',
      'text-2': '#ababab',
      links: '#56Caf0',
      'sidebar-text': '#f5f5f5',
    },
    'dark-default': {
      'background-0': '#161616',
      'background-1': '#1e1e1e',
      'background-2': '#262626',
      borders: '#3c3c3c',
      'text-0': '#f5f5f5',
      'text-1': '#e2e2e2',
      'text-2': '#ababab',
      links: '#56Caf0',
      sidebar: '#1e1e1e',
      'sidebar-text': '#f5f5f5',
    },
    'dark-dark': {
      'background-0': '#101010',
      'background-1': '#121212',
      'background-2': '#1a1a1a',
      borders: '#272727',
      sidebar: '#121212',
      'text-0': '#f5f5f5',
      'text-1': '#e2e2e2',
      'text-2': '#ababab',
      links: '#56Caf0',
      'sidebar-text': '#f5f5f5',
    },
    'dark-darker': {
      'background-0': '#000000',
      'background-1': '#000000',
      'background-2': '#000000',
      borders: '#000000',
      sidebar: '#000000',
      'text-0': '#c5c5c5',
      'text-1': '#c5c5c5',
      'text-2': '#c5c5c5',
      links: '#c5c5c5',
      'sidebar-text': '#c5c5c5',
    },
    'dark-blue': {
      'background-0': '#14181d',
      'background-1': '#1a2026',
      'background-2': '#212930',
      borders: '#2e3943',
      sidebar: '#1a2026',
      'text-0': '#f5f5f5',
      'text-1': '#e2e2e2',
      'text-2': '#ababab',
      links: '#56Caf0',
      'sidebar-text': '#f5f5f5',
    },
    'dark-mint': {
      'background-0': '#0f0f0f',
      'background-1': '#0c0c0c',
      'background-2': '#141414',
      borders: '#1e1e1e',
      sidebar: '#0c0c0c',
      'text-0': '#f5f5f5',
      'text-1': '#e2e2e2',
      'text-2': '#ababab',
      links: '#7CF3CB',
      'sidebar-text': '#f5f5f5',
    },
    'dark-burn': {
      'background-0': '#ffffff',
      'background-1': '#ffffff',
      'background-2': '#ffffff',
      borders: '#cccccc',
      sidebar: '#ffffff',
      'text-0': '#cccccc',
      'text-1': '#cccccc',
      'text-2': '#cccccc',
      links: '#cccccc',
      'sidebar-text': '#cccccc',
    },
    'dark-unicorn': {
      'background-0': '#ff6090',
      'background-1': '#00C1FF',
      'background-2': '#FFFF00',
      borders: '#FFFF00',
      sidebar: '#00C1FF',
      'text-0': '#ffffff',
      'text-1': '#ffffff',
      'text-2': '#ffffff',
      links: '#000000',
      'sidebar-text': '#ffffff',
    },
    'dark-lightmode': {
      'background-0': '#ffffff',
      'background-1': '#f5f5f5',
      'background-2': '#d4d4d4',
      borders: '#c7cdd1',
      links: '#04ff00',
      sidebar: '#04ff00',
      'sidebar-text': '#ffffff',
      'text-0': '#2d3b45',
      'text-1': '#919191',
      'text-2': '#a5a5a5',
    },
    'dark-catppuccin': {
      'background-0': '#11111b',
      'background-1': '#181825',
      'background-2': '#1e1e2e',
      borders: '#4f5463',
      'text-0': '#cdd6f4',
      'text-1': '#7f849c',
      'text-2': '#a6e3a1',
      links: '#f5c2e7',
      sidebar: '#181825',
      'sidebar-text': '#7f849c',
    },
    'dark-sage': {
      'background-0': '#2f3e46',
      'background-1': '#354f52',
      'background-2': '#52796f',
      borders: '#84a98c',
      links: '#d8f5c7',
      sidebar: '#354f52',
      'sidebar-text': '#e2e8de',
      'text-0': '#e2e8de',
      'text-1': '#cad2c5',
      'text-2': '#adb1aa',
    },
    'dark-pink': {
      'background-0': '#ffffff',
      'background-1': '#ffe0ed',
      'background-2': '#ff0066',
      borders: '#ff007b',
      links: '#ff0088',
      sidebar: '#f490b3',
      'sidebar-text': '#ffffff',
      'text-0': '#ff0095',
      'text-1': '#ff8f8f',
      'text-2': '#ff5c5c',
    },
    'dark-coral': {
      'background-0': '#131c26',
      'background-1': '#0e1721',
      'background-2': '#151c24',
      borders: '#0e1721',
      links: '#f88379',
      sidebar: '#131c26',
      'sidebar-text': '#f88379',
      'text-0': '#f88379',
      'text-1': '#f88379',
      'text-2': '#f88379',
    },
  };
  if (preset === null) preset = presets[e.target.id] || presets['default'];
  applyPreset(preset);
}

function applyPreset(preset) {
  chrome.storage.sync.set({ dark_preset: preset }).then(() => refreshColors());
}

/*
function setToDefaults() {
    fetch(chrome.runtime.getURL('js/darkcss.json'))
        .then((resp) => resp.json())
        .then(function (result) {
            chrome.storage.local.set({ "dark_css": result["dark_css"], "dark_preset": { "background-0": "#161616", "background-1": "#1e1e1e", "background-2": "#262626", "borders": "#3c3c3c", "text-0": "#f5f5f5", "text-1": "#e2e2e2", "text-2": "#ababab", "links": "#56Caf0", "sidebar": "#1e1e1e", "sidebar-text": "#f5f5f5" } }).then(() => refreshColors());
        });
}
*/
/*
function makeElement(element, elclass, location, text) {
    let creation = document.createElement(element);
    creation.className = elclass;
    creation.textContent = text;
    location.appendChild(creation);
    return creation
}*/

function makeElement(element, location, options) {
  let creation = document.createElement(element);
  Object.keys(options).forEach((key) => {
    creation[key] = options[key];
  });
  location.appendChild(creation);
  return creation;
}

async function sendFromPopup(message, options = {}) {
  let response = new Promise((resolve, reject) => {
    chrome.tabs.query({ currentWindow: true }).then(async (tabs) => {
      for (let i = 0; i < tabs.length; i++) {
        try {
          let res = await chrome.tabs.sendMessage(tabs[i].id, {
            message: message,
            options: options,
          });
          if (res) resolve(res);
        } catch (e) {}
      }
      resolve(null);
    });
  });

  return await response;
}
