import React, { useEffect } from 'react'
import axiosInstance from '../../utils/axiosInstance'
import Navbar from '../../components/Navbar/Navbar'
import Notecard from '../../components/Cards/Notecard'
import { MdAdd } from 'react-icons/md'
import AddEditNotes from './AddEditNotes'
import Modal from 'react-modal'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import moment from 'moment'
import Toast from '../../components/ToastMessage/Toast'
import EmptyCard from '../../components/EmptyCard/EmptyCard'


function Home() {


   
   
    const [openAddEditModal, setOpenAddEditModal] = useState({
        isShown : false,
        type: 'add',
        data: null,
    });

    const [showToast, setShowToast] = useState({
        isShown: false,
        message: '',
        type: 'add',
    
    });
    const [allNotes, setAllNotes] = useState([]); 
    const [userInfo, setUserInfo] = useState('');


    const [isSearch, setIsSearch] = useState(false);

    const navigate = useNavigate();

    const handleEdit =(noteDetails)=>{
        setOpenAddEditModal({
            isShown:true,
            data:noteDetails,
            type:"edit",
             }); }
    
     const ShowToastMessage =(message,type)=>{
            setShowToast({
                    isShown:true,
                    message:message,  
                    type:type,
         });
    };


    const handleCloseToast =()=>{
        setShowToast({
            isShown:false,
            message:'',  
        });
    };
    //get userInfo 

    const getUserInfo = async()=>{
        try {
            const response = await axiosInstance.get('/get-user');
            if(response.data && response.data.user){
                setUserInfo(response.data.user);
            }
            
        } catch (error) {
            if(error.response.status === 401){
                localStorage.clear();
                navigate('/login');
            }
        }
    };

    //Get all notes

    const getallnotes = async()=>{
        try{
            const response = await axiosInstance.get('/get-all-notes');
            if(response.data && response.data.notes){
                setAllNotes(response.data.notes);
            }

        }catch(error){
            console.log("An unexpected error occurred");
        }
    }
    //Delete note
    const deleteNote = async(data)=>{
        const noteId = data?._id;
        try {
            const response = await axiosInstance.delete('/delete-note/'+noteId);
           

            
      
            if(response.data && !response.data.error){
                ShowToastMessage("Note Deleted successfully",'delete');
                getallnotes();
               
            }

        } catch (error) {
            if(error.response && error.response.data && error.response.data.message){
                console.log("An unexpected error occurred");
        }


    }
    }

    //Search notes
    const searchNotes = async(query)=>{
        try {
            const response = await axiosInstance.get('/search-notes',{
                params:{query},

            });

            if(response.data && response.data.notes){
                setIsSearch(true);
                setAllNotes(response.data.notes);
            }
        } catch (error) {
            console.log(error);
            
        }

    }

    //handle clear search

    const handleClearSearch = ()=>{
        setIsSearch(false);
        getallnotes();
    

    }

    //Pin note
    const pinNote=async(noteData)=>{
        const noteId = noteData?._id;
        try {
            const response = await axiosInstance.put('/pin-note/'+noteId,{
                "isPinned":!noteId.isPinned
            });

            
      
            if(response.data && response.data.note){
                ShowToastMessage("Note Pinned successfully");
                getallnotes();
                
            }

        } catch (error) {
           console.log(error);
        }


    }
    

    useEffect(()=>{
        getallnotes();
        getUserInfo();
        return ()=>{}
    },[]);


  return (
    <>
    <Navbar userInfo={userInfo}  searchNotes={searchNotes} handleClearSearch={handleClearSearch}/>
    <div className='container mx-auto'>
        {allNotes.length>0 ? <div className='grid grid-cols-3 gap-4 mt-8'>
        {allNotes.map((item,index)=>(
            <Notecard
             key={item._id} title={item.title}
            date={moment(item.CreatedOn).format('MMM DD, YYYY')} 
            content={item.content}
            tags={item.tags}
            isPinned={item.isPinned}
            onEdit={()=>handleEdit(item)}
            onDelete={()=>deleteNote(item)}
            onPinNote={()=>{pinNote(item)}} />
        ))}
        
       
    </div> : <EmptyCard/>}
    </div>
    <button className='w-16 h-16 flex items-center justify-center rounded-2xl bg-primary hover:bg-blue-600  right-10 bottom-10 fixed' onClick={()=>{

        setOpenAddEditModal({
            isShown:true,
            type:'add',
            data:null,
        })
       
    }}  >
        <MdAdd className='text-[32px] text-white'/>

    </button>

    <Modal isOpen={openAddEditModal.isShown} onRequestClose={()=>{() => setOpenAddEditModal({ isShown: false, type: 'add', data: null })}} style={{
        overlay:{
            backgroundColor:"rgba(0,0,0,0.2)",
        }
    }}
    contentLabel=""
    className="w-[40%] max-h-3/4 bg-white rounded-md mx-auto mt-14 p-5 overflow-scroll"
    ariaHideApp={false}>
    <AddEditNotes type={openAddEditModal.type} noteData={openAddEditModal.data}  onClose={()=>{setOpenAddEditModal({ isShown:false,type:"add",data:null}) }}
  getallnotes={getallnotes} ShowToastMessage={ShowToastMessage}/>
    </Modal>

    <Toast showToast={showToast.isShown} 
           message={showToast.message} 
           type={showToast.type}
           onClose={handleCloseToast}/>
    </>
  )
}

export default Home