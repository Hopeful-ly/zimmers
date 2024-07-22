use std::ptr::null_mut;
use std::sync::Mutex;

use tauri::Emitter;
use windows::core::*;
use windows::Win32::Foundation::*;
use windows::Win32::System::DataExchange::AddClipboardFormatListener;
use windows::Win32::System::LibraryLoader::*;
use windows::Win32::UI::WindowsAndMessaging::*;

use clipboard_win::{formats, get_clipboard};

use std::sync::mpsc::{channel, Sender};
use std::thread;

lazy_static::lazy_static! {
    static ref SENDER: Mutex<Option<Sender<String>>> = Mutex::new(None);
}

extern "system" fn window_proc(hwnd: HWND, msg: u32, wparam: WPARAM, lparam: LPARAM) -> LRESULT {
    match msg {
        WM_DESTROY => {
            println!("WM_DESTROY received");
            unsafe {
                PostQuitMessage(0);
            }
            LRESULT(0)
        }
        WM_CLIPBOARDUPDATE => {
            // get the clipboard data
            let result = get_clipboard(formats::Unicode);

            let clipboard_data = match result {
                Ok(data) => data,
                Err(_) => {
                    return LRESULT(0);
                }
            };
            if let Ok(sender) = SENDER.lock() {
                if let Some(sender) = &*sender {
                    sender
                        .send(clipboard_data)
                        .expect("Failed to send data to the other thread");
                }
            }
            LRESULT(0)
        }
        _ => unsafe { DefWindowProcW(hwnd, msg, wparam, lparam) },
    }
}

fn register_window_class(instance: HINSTANCE) -> Result<WNDCLASSW> {
    let class_name = w!("my_window_class");

    let wc = WNDCLASSW {
        lpfnWndProc: Some(window_proc),
        hInstance: instance,
        lpszClassName: class_name,
        ..Default::default()
    };

    if unsafe { RegisterClassW(&wc) } == 0 {
        return Err(Error::from_win32());
    }

    Ok(wc)
}

fn create_window(instance: HINSTANCE) -> Result<HWND> {
    let class_name = w!("my_window_class");
    let window_name = w!("My Window");

    let hwnd = unsafe {
        CreateWindowExW(
            Default::default(),
            class_name,
            window_name,
            WS_OVERLAPPEDWINDOW,
            CW_USEDEFAULT,
            CW_USEDEFAULT,
            CW_USEDEFAULT,
            CW_USEDEFAULT,
            None,
            None,
            instance,
            None,
        )
        .unwrap()
    };

    if hwnd == HWND(null_mut()) {
        return Err(Error::from_win32());
    }

    Ok(hwnd)
}

fn run_message_loop() {
    let mut msg = MSG::default();

    unsafe {
        while GetMessageW(&mut msg, None, 0, 0).into() {
            let _ = TranslateMessage(&msg);
            DispatchMessageW(&msg);
        }
    }
}

pub fn run_clipboard_listener(app_handle: tauri::AppHandle) {
    let (tx, rx) = channel::<String>();
    {
        let mut sender = SENDER.lock().unwrap();
        *sender = Some(tx);
    }

    let _ = thread::spawn(move || {
        let instance = unsafe { GetModuleHandleW(None).expect("GetModuleHandleW failed") };
        let instance: HINSTANCE = instance.into(); // Explicitly cast HMODULE to HINSTANCE
        let _ = register_window_class(instance).expect("RegisterClassW failed");

        let hwnd = create_window(instance).expect("CreateWindowExW failed");

        unsafe {
            AddClipboardFormatListener(hwnd).expect("AddClipboardFormatListener failed");
        }

        run_message_loop();
    });

    let __ = thread::spawn(move || loop {
        let clipboard_data = rx.recv().expect("Failed to receive clipboard data");
        app_handle
            .emit("clipboard-update", clipboard_data)
            .expect("Failed to emit clipboard data");
    });
}
