document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', send_email);
  document.querySelector('#archive').addEventListener('click',(event) => archive_email(event.target));

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function send_email(event) {
  // Gets data from the form
  rec = document.querySelector('#compose-recipients').value;
  sub = document.querySelector('#compose-subject').value;
  bod = document.querySelector('#compose-body').value;

  event.preventDefault();
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: rec,
        subject: sub,
        body: bod
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      if (result['error']) {
        document.querySelector('#error').innerHTML = result['error'];
        document.querySelector('#error').style.display = 'block';
      }else {
        document.querySelector('#error').style.display = 'none';
        load_mailbox('sent');
      };
      console.log(result);
  });
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#emails').innerHTML = "";
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#headline').innerHTML = mailbox.charAt(0).toUpperCase() + mailbox.slice(1);

  // Fetch emails from API
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    for (i of emails) {
      const element = document.createElement('div');
      element.classList.add('col');
      element.innerHTML = `<b>${i["recipients"]}</b><b>${i["subject"]}</b><b>${i["timestamp"]}</b>`;
      element.dataset.id = i["id"];
      document.querySelector('#emails').append(element);
      document.querySelectorAll('.col').forEach(element => {
        element.addEventListener('click', (event) => email_id(event.currentTarget));
      });
    }
  });
}

function email_id(el) {
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email').style.display = 'block';

  fetch(`/emails/${el.dataset.id}`)
  .then(response => response.json())
  .then(email => {
    document.querySelector('#email-sender').innerHTML = "From: " + email['sender'];
    document.querySelector('#email-subject').innerHTML = "Subject: " + email['subject'];
    document.querySelector('#email-body').innerHTML = email['body'];
    document.querySelector('#email-timestamp').innerHTML = email['timestamp'];
    document.querySelector('#archive').dataset.id = el.dataset.id
    if (email['archived']) {
      document.querySelector('#archive').innerHTML = "Unarchive";
    }else {
      document.querySelector('#archive').innerHTML = "Archive";
    }
  });
}

function archive_email(element) {
  fetch(`/emails/${element.dataset.id}`)
  .then(response => response.json())
  .then(email => {
    fetch(`/emails/${element.dataset.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: !email['archived']
      })
    })
  }).then(window.location.reload())
}