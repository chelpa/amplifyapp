// import React from 'react';
// import logo from './logo.svg';
// import './App.css';

// import { Amplify } from 'aws-amplify';
// import { Authenticator } from '@aws-amplify/ui-react';
// import '@aws-amplify/ui-react/styles.css';
// import awsExports from './aws-exports';
// Amplify.configure(awsExports);
//
// export default function App() {
//   return (
//     <Authenticator>
//       {({ signOut, user }) => (
//         <main>
//           <h1>Hello {user.username}</h1>
//           <button onClick={signOut}>Sign out</button>
//         </main>
//       )}
//     </Authenticator>
//   );
// }

//export default withAuthenticator(App);

import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { API , Storage, Amplify} from 'aws-amplify';
import { withAuthenticator, Authenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsExports from './aws-exports';
import { listNotes } from './graphql/queries';
import { createNote as createNoteMutation, deleteNote as deleteNoteMutation } from './graphql/mutations';
Amplify.configure(awsExports);


const initialFormState = { name: '', description: '' }

export default function App() {
  const [notes, setNotes] = useState([]);
  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    const apiData = await API.graphql({ query: listNotes });
    const notesFromAPI = apiData.data.listNotes.items;
    await Promise.all(notesFromAPI.map(async note => {
      if (note.image) {
        const image = await Storage.get(note.image);
        note.image = image;
      }
      return note;
    }))
    setNotes(apiData.data.listNotes.items);
  }
  async function onChange(e) {
if (!e.target.files[0]) return
const file = e.target.files[0];
setFormData({ ...formData, image: file.name });
await Storage.put(file.name, file);
fetchNotes();
}
  async function createNote() {
  if (!formData.name || !formData.description) return;
  await API.graphql({ query: createNoteMutation, variables: { input: formData } });
  if (formData.image) {
    const image = await Storage.get(formData.image);
    formData.image = image;
  }
  setNotes([ ...notes, formData ]);
  setFormData(initialFormState);
}

  async function deleteNote({ id }) {
    const newNotesArray = notes.filter(note => note.id !== id);
    setNotes(newNotesArray);
    await API.graphql({ query: deleteNoteMutation, variables: { input: { id } }});
  }


  return (
    <Authenticator>
    {({ signOut, user }) => (
            <main>
    <button onClick={signOut}>Sign out</button>



      <h1>My Notes App</h1>
      <input
        onChange={e => setFormData({ ...formData, 'name': e.target.value})}
        placeholder="Note name"
        value={formData.name}
      />
      <input
        onChange={e => setFormData({ ...formData, 'description': e.target.value})}
        placeholder="Note description"
        value={formData.description}
      />
      <input
  type="file"
  onChange={onChange}
/>
      <button onClick={createNote}>Create Note</button>
      <div style={{marginBottom: 30}}>
      {
notes.map(note => (
  <div key={note.id || note.name}>
    <h2>{note.name}</h2>
    <p>{note.description}</p>
    <button onClick={() => deleteNote(note)}>Delete note</button>
    {
      note.image && <img src={note.image} style={{width: 400}} />
    }
  </div>
))
}

      </div>


      </main>

   )}
  </Authenticator>

  );
}

//export default withAuthenticator(App);
