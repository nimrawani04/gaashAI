<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Use the original standalone SVG chinar leaf-to-bot animation on phone startup and sign-in, not the app-icon artwork, to preserve the preferred transition.
- Track ready-made lesson quiz completion in device storage by language and lesson ID so progress remains available on the phone without connectivity.
- Store native lesson progress in Capacitor Preferences and migrate existing WebView localStorage results, because clearing WebView data must not erase completed quizzes.
- Lesson progress and quiz history sync per account via the user_lesson_state row (merged with device storage, newest wins) so phone and web share them.
