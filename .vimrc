if empty(glob('~/.vim/autoload/plug.vim'))
  silent !curl -fLo ~/.vim/autoload/plug.vim --create-dirs
    \ https://raw.githubusercontent.com/junegunn/vim-plug/master/plug.vim
  autocmd VimEnter * PlugInstall --sync | source $MYVIMRC
endif

" Plugins will be downloaded under the specified directory.
call plug#begin('~/.vim/plugged')

" Declare the list of plugins.
"Plug 'ervandew/supertab'

Plug 'itchyny/lightline.vim'
Plug 'junegunn/fzf', { 'do': { -> fzf#install() } }
Plug 'sheerun/vim-polyglot'
Plug 'dense-analysis/ale'
Plug 'scrooloose/nerdtree'
Plug 'Valloric/YouCompleteMe', { 'do': './install.py --clang-completer' }

" List ends here. Plugins become visible to Vim after this call.
call plug#end()



" lightline colors..
if !has('gui_running')
      set t_Co=256
  endif

  let g:lightline = {
        \ 'colorscheme': 'wombat',
        \ }

" Enable ESLint only for JavaScript.
let b:ale_linters = ['eslint']

"YouCompleteMe
let g:ycm_global_ycm_extra_conf = '~/.vim/.ycm_extra_conf.py'


set tabstop=4
set shiftwidth=4
set expandtab

set exrc " lets vim use .vimrc in current working dir
