import React from 'react'
import TagInput from '../../components/Input/TagInput'
import { useState } from 'react'
import { MdClose } from 'react-icons/md';
import axiosInstance from '../../utils/axiosInstance';



function AddEditNotes({getallnotes,noteData,type,onClose,ShowToastMessage}){
    const [title, setTitle] = useState(noteData?.title ||'');
    const [content, setContent] = useState(noteData?.content ||'');
    const [tags, setTags] = useState(noteData?.tags ||[]);
    const [error, setError] = useState('');
    const noteId = noteData?._id;
   
   
//add notes
    const addNewNote = async()=>{
        try {
            const response = await axiosInstance.post('/add-note',{
                title,
                content,
                tags

            });

            
      
            if(response.data && response.data.note){
                ShowToastMessage("Note added successfully");
                getallnotes();
                onClose();
               
            }

        } catch (error) {
            if(error.response && error.response.data && error.response.data.message){
                setError(error.response.data.message);
        }


    }};

// edit notes
    const EditNote = async()=>{
        
        
        try {
            const response = await axiosInstance.put('/edit-note/'+noteId,{
                title,
                content,
                tags
            });

            
      
            if(response.data && response.data.note){
                ShowToastMessage("Note Updated successfully");
                getallnotes();
                onClose();
            }

        } catch (error) {
            if(error.response && error.response.data && error.response.data.message){
                setError(error.response.data.message);
        }


    }
    };

    const handleAddNote = async ()=> {
        if(!title){
            setError('Please enter a title');
            return;

        }
        if(!content){
            setError('Please enter content');
            return;
        }
        setError('');

    
            if (type === "edit") {

                await EditNote();
                
          
              } else {
          
                await addNewNote();
          
                getallnotes();
                
          
                onClose();
          
              }
        
    
}

    console.log(error);

  return (
    <div className='relative'>

        <button className='w-10 h-10 rounded-full flex items-center justify-center absolute -top-3 -right-3 hover:bg-slate-100' onClick={onClose}>
            <MdClose className='text-xl text-slate-400'/>
        </button>
        <div className='flex flex-col gap-2'>
             <label className='input-label'>TITLE</label>
             < input
                type='text'
                className='text-2xl text-slate-950 outline-none'
                placeholder='Go to Gym At 5pm'
                value={title}
                onChange={({target})=>{setTitle(target.value)}}
                />
        </div>
        <div className='flex flex-col gap-2 mt-4'>
        <label className='input-label'>CONTENT</label>
        <textarea
           type="text"
           className='text-sm text-slate-950 outline-none bg-slate-50 rounded p-2'
           placeholder='Write your notes here'
           rows={10}
           value ={content}
              onChange={({target})=>{setContent(target.value)}}
           />

        



        </div>
      <div className='mt-3'>
        <label className='input-label'>TAGS</label>
        <TagInput tags={tags} setTags={setTags}/>
      </div>

      {error && <p className='text-red-500 text-xs pt-4'>{error}</p>}
      <button className='btn-primary font-medium mt-5 p-3' onClick={()=>{handleAddNote()}}>
           {type === 'edit' ? 'Edit Note' : 'Add Note'  }
        </button>

    </div>
  )
}

export default AddEditNotes