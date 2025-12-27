/**
 * @copyright  (C) 2018 Open Source Matters, Inc. <https://www.joomla.org>
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */
const DemoData = {
  inProgress: false
};
const demodataAjax = (type, steps, step, action) => {
  // Get variables
  const baseUrl = `index.php?option=com_ajax&format=json&group=demodata&${Joomla.getOptions('csrf.token')}=1`;

  // Create list
  const list = document.createElement('div');
  list.classList.add(`demodata-steps-${type}-${step}`);
  list.setAttribute('role', 'region');
  list.setAttribute('aria-live', 'polite');

  // Create paragraph
  const para = document.createElement('p');
  para.classList.add('loader-image');

  // Create image
  const loaderEl = document.createElement('joomla-core-loader');
  loaderEl.setAttribute('inline', true);
  loaderEl.setAttribute('size', 60);
  loaderEl.setAttribute('color', 'transparent');

  // Append everything
  para.appendChild(loaderEl);
  list.appendChild(para);
  document.querySelector(`.demodata-progress-${type}`).appendChild(list);
  Joomla.request({
    url: `${baseUrl}&type=${type}&plugin=DemodataApplyStep${step}&step=${step}&action=${action}`,
    method: 'GET',
    perform: true,
    onSuccess: resp => {
      // Remove loader image
      const loader = list.querySelector('.loader-image');
      loader.parentNode.removeChild(loader);
      let response = {};
      try {
        response = JSON.parse(resp);
      } catch (e) {
        Joomla.renderMessages({
          error: [Joomla.Text._('MOD_DEMODATA_INVALID_RESPONSE') + resp]
        }, `.demodata-steps-${type}-${step}`);
        DemoData.inProgress = false;
        return;
      }
      let progressClass = '';
      let success;
      if (response.success && response.data && response.data.length > 0) {
        const progress = document.querySelector(`.demodata-progress-${type} .progress-bar`);

        // Display all messages that we got
        response.data.forEach(value => {
          if (value === null) {
            return;
          }
          success = value.success;
          progressClass = success ? 'bg-success' : 'bg-danger';

          // Display success alert
          if (success) {
            Joomla.renderMessages({
              message: [value.message]
            }, `.demodata-steps-${type}-${step}`, false, 3000);
          } else {
            Joomla.renderMessages({
              error: [value.message]
            }, `.demodata-steps-${type}-${step}`, false);
          }
        });

        // Update progress
        progress.innerText = `${step}/${steps}`;
        progress.style.width = `${step / steps * 100}%`;
        progress.setAttribute('aria-valuemin', 0);
        progress.setAttribute('aria-valuemax', 100);
        progress.setAttribute('aria-valuenow', step / steps * 100);
        progress.classList.add(progressClass);

        // Move on next step
        if (success && step <= steps) {
          const stepNew = step + 1;
          if (stepNew <= steps) {
            demodataAjax(type, steps, stepNew, action);
          } else {
            const bar = document.querySelector(`.demodata-progress-${type}`);
            // Hide the progress bar but keep it for install/uninstall.
            bar.classList.add('d-none');
            if (action === 'install') {
              Joomla.renderMessages({message: [Joomla.Text._('MOD_DEMODATA_COMPLETED_INSTALL')]});
            } else {
              Joomla.renderMessages({message: [Joomla.Text._('MOD_DEMODATA_COMPLETED_UNINSTALL')]});
            }
            window.scroll({
              top: 0,
              left: 0,
              behavior: 'smooth'
            });
            DemoData.inProgress = false;

            // After the last step switch the Install / Uninstall buttons.
            const btni = document.querySelector(`[data-type="${type}"][data-action="install"]`);
            const btnu = document.querySelector(`[data-type="${type}"][data-action="uninstall"]`);
            if (action === 'install') {
              btni.classList.remove('d-block');
              btni.classList.add('d-none');
              btnu.classList.remove('d-none');
              btnu.classList.add('d-block');
            } else {
              btni.classList.remove('d-none');
              btni.classList.add('d-block');
              btnu.classList.remove('d-block');
              btnu.classList.add('d-none');
            }
          }
        }
      } else {
        // Display error alert
        Joomla.renderMessages({
          error: [Joomla.Text._('MOD_DEMODATA_INVALID_RESPONSE')]
        });
        window.scroll({
          top: 0,
          left: 0,
          behavior: 'smooth'
        });
        DemoData.inProgress = false;
      }
    },
    onError: () => {
      Joomla.renderMessages({
        error: [Joomla.Text._('MOD_DEMODATA_ERROR_RESPONSE')]
      });
      window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
      DemoData.inProgress = false;
    }
  });
};
const demodataApply = element => {
  const type = element.getAttribute('data-type');
  const steps = element.getAttribute('data-steps');
  const action = element.getAttribute('data-action');

  // Check whether the work in progress or we already processed with current item
  if (DemoData.inProgress) {
    return;
  }
  if (element.getAttribute('data-processed')) {
    alert(Joomla.Text._('MOD_DEMODATA_ITEM_ALREADY_PROCESSED'));
    DemoData.inProgress = false;
    return;
  }

  // Make sure that use run this not by random clicking on the page links
  // @todo use the CE Modal here
  if (!window.confirm(Joomla.Text._('MOD_DEMODATA_CONFIRM_START'))) {
    return false;
  }

  // Turn on the progress container
  document.querySelectorAll(`.demodata-progress-${type}`).forEach(progressElement => {
    progressElement.classList.remove('d-none');
  });
  //element.setAttribute('data-processed', true);
  DemoData.inProgress = true;
  demodataAjax(type, steps, 1, action);
  return false;
};
const demoDataWrapper = document.getElementById('demo-data-wrapper');
if (demoDataWrapper) {
  demoDataWrapper.querySelectorAll('.apply-demo-data').forEach(link => {
    link.addEventListener('click', ({
      currentTarget
    }) => demodataApply(currentTarget));
  });
  demoDataWrapper.querySelectorAll('.unapply-demo-data').forEach(link => {
    link.addEventListener('click', ({
      currentTarget
    }) => demodataApply(currentTarget));
  });
}
