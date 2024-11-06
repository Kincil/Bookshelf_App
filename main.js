document.addEventListener('DOMContentLoaded', function () {
  const books = [];

  // custom event
  const RENDER_EVENT = 'render-book';
  const SAVED_EVENT = 'saved-book';

  // key dari storage
  const STORAGE_KEY = 'BOOKS_APPS';

  // membuat id random
  const generateId = () => +new Date().getTime();

  function generateBookObject(id, title, author, year, isComplete) {
    return {
      id,
      title,
      author,
      year,
      isComplete,
    };
  }

  const submit = document.getElementById('bookForm');
  submit.addEventListener('submit', function (event) {
    event.preventDefault();
    addBook();
  });

  function isStorageExist() {
    if (typeof Storage === undefined) {
      alert('Browser Anda tidak mendukung Web Storage');
      return false;
    }
    return true;
  }

  document.addEventListener(RENDER_EVENT, function () {
    // console.log(books);
    const unCompletedBookList = document.getElementById('incompleteBookList');
    unCompletedBookList.innerHTML = '';

    const completedBookList = document.getElementById('completeBookList');
    completedBookList.innerHTML = '';

    for (const bookItem of books) {
      const bookElement = makeBookList(bookItem);
      if (!bookItem.isComplete) {
        unCompletedBookList.append(bookElement);
      } else {
        completedBookList.append(bookElement);
      }
    }
  });

  document.addEventListener(SAVED_EVENT, function () {
    console.log(localStorage.getItem(STORAGE_KEY));
    alert('Berhasil!');
  });

  function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_EVENT));
    }
  }

  function addBook() {
    const bookFormTitle = document.getElementById('bookFormTitle').value;
    const bookFormAuthor = document.getElementById('bookFormAuthor').value;
    const bookFormYear = parseInt(document.getElementById('bookFormYear').value);
    const bookFormIsComplete = document.getElementById('bookFormIsComplete').checked;

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, bookFormTitle, bookFormAuthor, bookFormYear, bookFormIsComplete);

    books.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  // function membuat buku
  function makeBookList(bookObject) {
    const title = document.createElement('h3');
    title.innerHTML = `Judul Buku : ${bookObject.title}`;
    title.setAttribute('data-testid', 'bookItemTitle');

    const author = document.createElement('p');
    author.innerHTML = `Penulis : ${bookObject.author}`;
    author.setAttribute('data-testid', 'bookItemAuthor');

    const year = document.createElement('p');
    year.innerHTML = `Tahun : ${bookObject.year}`;
    year.setAttribute('data-testid', 'bookItemYear');

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(title, author, year);

    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.append(textContainer);
    container.setAttribute('data-bookid', bookObject.id);
    container.setAttribute('data-testid', 'bookItem');

    if (bookObject.isComplete) {
      const undoBtn = document.createElement('button');
      undoBtn.classList.add('undo-button');
      undoBtn.innerHTML = 'Belum Selesai';
      undoBtn.setAttribute('data-testid', 'bookItemIsCompleteButton');

      undoBtn.addEventListener('click', function () {
        undoBookFormCompleted(bookObject.id);
      });

      const editBtn = document.createElement('button');
      editBtn.classList.add('edit-button');
      editBtn.innerHTML = `Edit <br> Buku`;
      editBtn.setAttribute('data-testid', 'bookItemEditButton');

      editBtn.addEventListener('click', function () {
        editBookFormCompleted(bookObject.id);
      });

      const trashBtn = document.createElement('button');
      trashBtn.classList.add('trash-button');
      trashBtn.innerHTML = 'Hapus Buku';
      trashBtn.setAttribute('data-testid', 'bookItemDeleteButton');

      trashBtn.addEventListener('click', function () {
        removeBookFormCompleted(bookObject.id);
      });

      textContainer.append(undoBtn, editBtn, trashBtn);
    } else {
      const checkBtn = document.createElement('button');
      checkBtn.classList.add('check-button');
      checkBtn.innerHTML = 'Sudah Selesai';
      checkBtn.setAttribute('data-testid', 'bookItemIsCompleteButton');

      checkBtn.addEventListener('click', function () {
        addBooksReadToCompleted(bookObject.id);
      });

      const editBtn = document.createElement('button');
      editBtn.classList.add('edit-button');
      editBtn.innerHTML = `Edit <br> Buku`;
      editBtn.setAttribute('data-testid', 'bookItemEditButton');

      editBtn.addEventListener('click', function () {
        editBookFormCompleted(bookObject.id);
      });

      const trashBtn = document.createElement('button');
      trashBtn.classList.add('trash-button');
      trashBtn.innerHTML = 'Hapus Buku';
      trashBtn.setAttribute('data-testid', 'bookItemDeleteButton');

      trashBtn.addEventListener('click', function () {
        removeBookFormCompleted(bookObject.id);
      });

      textContainer.append(checkBtn, editBtn, trashBtn);
    }

    return container;
  }

  // button untuk buku selesai dibaca
  function addBooksReadToCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  // button untuk hapus
  function removeBookFormCompleted(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    books.splice(bookTarget, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  // Button belum selesai dibaca
  function undoBookFormCompleted(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
  }

  // mengedit buku
  function editBookFormCompleted(bookId) {
    const book = books.find((b) => b.id === bookId);
    if (book) {
      const newTitle = prompt(`Masukkan judul baru: ${book.title}`);
      const newAuthor = prompt(`Masukkan penulis baru: ${book.author}`);
      const newYear = Number(prompt(`Masukkan Tahun Terbit yang baru: ${book.year}`));

      if (newTitle && newAuthor && newYear) {
        book.title = newTitle;
        book.author = newAuthor;
        book.year = newYear;
        saveData();
        document.dispatchEvent(new Event(RENDER_EVENT));
      }
    }
  }

  function findBook(bookId) {
    for (const bookItem of books) {
      if (bookItem.id == bookId) {
        return bookItem;
      }
    }
    return null;
  }

  function findBookIndex(bookId) {
    for (const index in books) {
      if (books[index].id == bookId) {
        return index;
      }
    }
    return -1;
  }

  function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
      for (const book of data) {
        books.push(book);
      }
    }
    document.dispatchEvent(new Event(RENDER_EVENT));
  }

  // const findBook = (bookId) => books.find((b) => b.id === bookId) || null;

  // const findBookIndex = (bookId) => books.findIndex((book) => book.id === bookId);

  // const loadDataFromStorage = () => {
  //   const serializedData = localStorage.getItem(STORAGE_KEY);
  //   const data = serializedData ? JSON.parse(serializedData) : [];

  //   books.push(...data);
  //   document.dispatchEvent(new Event(RENDER_EVENT));
  // };

  if (isStorageExist()) {
    loadDataFromStorage();
  }
});
